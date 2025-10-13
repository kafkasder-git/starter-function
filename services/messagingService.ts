/**
 * @fileoverview Messaging Service
 * @description Core messaging service for real-time chat functionality
 */

import { db, collections, queryHelpers, STORAGE_BUCKETS } from '@/lib/database';
import { storageService } from '@/lib/storage/storageService';
import { ID } from '@/lib/appwrite';
import { logger } from '@/lib/logging/logger';
import { useAuthStore } from '@/stores/authStore';
import { MessagingServiceError } from '@/types/messaging';
import type {
  Conversation,
  ConversationDocument,
  ConversationParticipantDocument,
  Message,
  MessageDocument,
  MessageAttachmentDocument,
  MessageReadStatusDocument,
  UserPresenceDocument,
  TypingIndicatorDocument,
  CreateConversationData,
  SendMessageData,
  MessageFilters,
  ConversationFilters,
  UserPresenceStatus,
  MessageReadStatus,
  ConversationParticipant,
} from '@/types/messaging';
import type { Models } from 'appwrite';

/**
 * Messaging Service Class
 */
export class MessagingService {
  private static instance: MessagingService;

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  private constructor() {
    logger.info('MessagingService initialized');
  }

  /**
   * Get current user from auth store
   */
  private getCurrentUser() {
    const { user } = useAuthStore.getState();
    if (!user) {
      throw new MessagingServiceError('UNAUTHORIZED', 'User not authenticated');
    }
    return user;
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      const currentUser = this.getCurrentUser();
      const conversationId = ID.unique();

      logger.info('Creating conversation', {
        type: data.type,
        participantCount: data.participantIds.length,
        createdBy: currentUser.id,
      });

      // Create conversation document
      const conversationDoc: Omit<ConversationDocument, keyof Models.Document> = {
        name: data.name,
        type: data.type,
        created_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: undefined,
        is_active: true,
      };

      const { error: conversationError } = await db.create(
        collections.CONVERSATIONS,
        conversationDoc,
        conversationId
      );

      if (conversationError) {
        throw new MessagingServiceError(
          'CONVERSATION_CREATE_FAILED',
          'Failed to create conversation',
          conversationError
        );
      }

      // Add participants
      const participants = [currentUser.id, ...data.participantIds];
      const participantPromises = participants.map((userId) => {
        const participantDoc: Omit<ConversationParticipantDocument, keyof Models.Document> = {
          conversation_id: conversationId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          role: userId === currentUser.id ? 'admin' : 'member',
          is_active: true,
          last_read_at: undefined,
        };

        return db.create(collections.CONVERSATION_PARTICIPANTS, participantDoc, ID.unique());
      });

      const participantResults = await Promise.all(participantPromises);
      const participantErrors = participantResults.filter((result) => result.error);

      if (participantErrors.length > 0) {
        logger.error('Some participants could not be added', { errors: participantErrors });
        // Continue anyway - conversation is created
      }

      // Get full conversation with participants
      const fullConversation = await this.getConversationById(conversationId);
      if (!fullConversation) {
        throw new MessagingServiceError(
          'CONVERSATION_NOT_FOUND',
          'Conversation created but could not be retrieved'
        );
      }

      logger.info('Conversation created successfully', { conversationId });
      return fullConversation;
    } catch (error) {
      logger.error('Failed to create conversation', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to create conversation', error);
    }
  }

  /**
   * Get conversations for a user
   */
  async getConversations(filters: ConversationFilters): Promise<Conversation[]> {
    try {
      logger.info('Loading conversations', { userId: filters.userId });

      // Get conversation participants for the user
      const { data: participantData, error: participantError } = await db.list(
        collections.CONVERSATION_PARTICIPANTS,
        [
          queryHelpers.equal('user_id', filters.userId),
          queryHelpers.equal('is_active', true),
          queryHelpers.orderDesc('joined_at'),
        ]
      );

      if (participantError) {
        throw new MessagingServiceError(
          'PARTICIPANTS_FETCH_FAILED',
          'Failed to fetch user participants',
          participantError
        );
      }

      if (!participantData?.documents?.length) {
        return [];
      }

      const conversationIds = participantData.documents.map((p) => p.conversation_id);

      // Get conversations - use OR query for multiple IDs
      let conversationQueries = [queryHelpers.equal('is_active', true)];

      // Add OR conditions for each conversation ID
      if (conversationIds.length > 0) {
        conversationQueries.push(...conversationIds.map((id) => queryHelpers.equal('$id', id)));
      }

      if (filters.type) {
        conversationQueries.push(queryHelpers.equal('type', filters.type));
      }

      const { data: conversationData, error: conversationError } = await db.list(
        collections.CONVERSATIONS,
        [...conversationQueries, queryHelpers.orderDesc('last_message_at')]
      );

      if (conversationError) {
        throw new MessagingServiceError(
          'CONVERSATIONS_FETCH_FAILED',
          'Failed to fetch conversations',
          conversationError
        );
      }

      if (!conversationData?.documents?.length) {
        return [];
      }

      // Get participants for each conversation
      const conversations: Conversation[] = [];

      for (const convDoc of conversationData.documents) {
        const conversation = await this.buildConversationFromDocument(convDoc, filters.userId);
        if (conversation) {
          conversations.push(conversation);
        }
      }

      logger.info('Conversations loaded successfully', { count: conversations.length });
      return conversations;
    } catch (error) {
      logger.error('Failed to get conversations', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to get conversations', error);
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const currentUser = this.getCurrentUser();

      const { data: conversation, error } = await db.get<ConversationDocument>(
        collections.CONVERSATIONS,
        conversationId
      );

      if (error) {
        throw new MessagingServiceError('CONVERSATION_NOT_FOUND', 'Conversation not found', error);
      }

      if (!conversation) {
        throw new MessagingServiceError('CONVERSATION_NOT_FOUND', 'Conversation not found');
      }

      const fullConversation = await this.buildConversationFromDocument(
        conversation,
        currentUser.id
      );
      return fullConversation;
    } catch (error) {
      logger.error('Failed to get conversation by ID', { conversationId, error });
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to get conversation', error);
    }
  }

  /**
   * Add participants to a conversation
   */
  async addParticipants(conversationId: string, userIds: string[]): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      // Check if user has admin role in conversation
      await this.checkConversationPermission(conversationId, currentUser.id, 'admin');

      logger.info('Adding participants to conversation', { conversationId, userIds });

      const participantPromises = userIds.map((userId) => {
        const participantDoc: Omit<ConversationParticipantDocument, keyof Models.Document> = {
          conversation_id: conversationId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          role: 'member',
          is_active: true,
          last_read_at: undefined,
        };

        return db.create(collections.CONVERSATION_PARTICIPANTS, participantDoc, ID.unique());
      });

      const results = await Promise.all(participantPromises);
      const errors = results.filter((result) => result.error);

      if (errors.length > 0) {
        logger.error('Some participants could not be added', { errors });
        throw new MessagingServiceError(
          'PARTICIPANTS_ADD_FAILED',
          'Some participants could not be added'
        );
      }

      logger.info('Participants added successfully');
    } catch (error) {
      logger.error('Failed to add participants', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to add participants', error);
    }
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      // Check if user has admin role or is removing themselves
      if (userId !== currentUser.id) {
        await this.checkConversationPermission(conversationId, currentUser.id, 'admin');
      }

      logger.info('Removing participant from conversation', { conversationId, userId });

      // Get participant document
      const { data: participantData, error: participantError } = await db.list(
        collections.CONVERSATION_PARTICIPANTS,
        [
          queryHelpers.equal('conversation_id', conversationId),
          queryHelpers.equal('user_id', userId),
        ]
      );

      if (participantError || !participantData?.documents?.length) {
        throw new MessagingServiceError(
          'PARTICIPANT_NOT_FOUND',
          'Participant not found in conversation'
        );
      }

      const participant = participantData.documents[0];

      // Update participant to inactive
      const { error: updateError } = await db.update(
        collections.CONVERSATION_PARTICIPANTS,
        participant.$id,
        { is_active: false }
      );

      if (updateError) {
        throw new MessagingServiceError(
          'PARTICIPANT_REMOVE_FAILED',
          'Failed to remove participant',
          updateError
        );
      }

      logger.info('Participant removed successfully');
    } catch (error) {
      logger.error('Failed to remove participant', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to remove participant', error);
    }
  }

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      const currentUser = this.getCurrentUser();

      // Check if user is participant in conversation
      await this.checkConversationPermission(data.conversationId, currentUser.id, 'member');

      logger.info('Sending message', {
        conversationId: data.conversationId,
        type: data.type,
        hasContent: !!data.content,
        attachmentCount: data.attachments?.length || 0,
      });

      const messageId = ID.unique();

      // Create message document
      const messageDoc: Omit<MessageDocument, keyof Models.Document> = {
        conversation_id: data.conversationId,
        sender_id: currentUser.id,
        content: data.content,
        type: data.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_deleted: false,
        reply_to_message_id: data.replyToMessageId,
      };

      const { data: message, error: messageError } = await db.create(
        collections.MESSAGES,
        messageDoc,
        messageId
      );

      if (messageError) {
        throw new MessagingServiceError(
          'MESSAGE_CREATE_FAILED',
          'Failed to create message',
          messageError
        );
      }

      if (!message) {
        throw new MessagingServiceError('MESSAGE_CREATE_FAILED', 'Message creation returned null');
      }

      // Upload attachments if any
      let attachments: any[] = [];
      if (data.attachments && data.attachments.length > 0) {
        attachments = await this.uploadMessageAttachments(messageId, data.attachments);
      }

      // Update conversation's last_message_at
      await db.update(collections.CONVERSATIONS, data.conversationId, {
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      });

      // Build full message object
      const fullMessage = await this.buildMessageFromDocument(message, attachments);
      if (!fullMessage) {
        throw new MessagingServiceError('MESSAGE_BUILD_FAILED', 'Failed to build message object');
      }

      logger.info('Message sent successfully', { messageId });
      return fullMessage;
    } catch (error) {
      logger.error('Failed to send message', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to send message', error);
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(filters: MessageFilters): Promise<Message[]> {
    try {
      const currentUser = this.getCurrentUser();

      // Check if user is participant in conversation
      await this.checkConversationPermission(filters.conversationId, currentUser.id, 'member');

      logger.info('Loading messages', { conversationId: filters.conversationId });

      let queries = [
        queryHelpers.equal('conversation_id', filters.conversationId),
        queryHelpers.equal('is_deleted', false),
        queryHelpers.orderDesc('created_at'),
        queryHelpers.limit(filters.limit || 50),
      ];

      if (filters.offset) {
        queries.push(queryHelpers.offset(filters.offset));
      }

      if (filters.before) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filters.before.toISOString()));
      }

      if (filters.after) {
        queries.push(queryHelpers.greaterThanEqualDate('created_at', filters.after.toISOString()));
      }

      const { data: messageData, error } = await db.list(collections.MESSAGES, queries);

      if (error) {
        throw new MessagingServiceError('MESSAGES_FETCH_FAILED', 'Failed to fetch messages', error);
      }

      if (!messageData?.documents?.length) {
        return [];
      }

      // Build message objects with attachments and read status
      const messages: Message[] = [];
      for (const msgDoc of messageData.documents) {
        const message = await this.buildMessageFromDocument(msgDoc);
        if (message) {
          messages.push(message);
        }
      }

      logger.info('Messages loaded successfully', { count: messages.length });
      return messages;
    } catch (error) {
      logger.error('Failed to get messages', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to get messages', error);
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      logger.info('Marking message as read', { messageId, userId: currentUser.id });

      // Check if already marked as read
      const { data: existingRead, error: existingError } = await db.list(
        collections.MESSAGE_READ_STATUS,
        [queryHelpers.equal('message_id', messageId), queryHelpers.equal('user_id', currentUser.id)]
      );

      if (existingError) {
        logger.warn('Error checking existing read status', existingError);
      }

      if (existingRead?.documents && existingRead.documents.length > 0) {
        logger.info('Message already marked as read');
        return;
      }

      // Create read status document
      const readStatusDoc: Omit<MessageReadStatusDocument, keyof Models.Document> = {
        message_id: messageId,
        user_id: currentUser.id,
        read_at: new Date().toISOString(),
      };

      const { error: createError } = await db.create(
        collections.MESSAGE_READ_STATUS,
        readStatusDoc,
        ID.unique()
      );

      if (createError) {
        throw new MessagingServiceError(
          'READ_STATUS_CREATE_FAILED',
          'Failed to mark message as read',
          createError
        );
      }

      logger.info('Message marked as read successfully');
    } catch (error) {
      logger.error('Failed to mark message as read', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to mark message as read', error);
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      // Get message to check ownership
      const { data: message, error: messageError } = await db.get<MessageDocument>(
        collections.MESSAGES,
        messageId
      );

      if (messageError) {
        throw new MessagingServiceError('MESSAGE_NOT_FOUND', 'Message not found', messageError);
      }

      if (!message) {
        throw new MessagingServiceError('MESSAGE_NOT_FOUND', 'Message not found');
      }

      // Check if user is the sender or has admin rights
      if (message.sender_id !== currentUser.id) {
        await this.checkConversationPermission(message.conversation_id, currentUser.id, 'admin');
      }

      logger.info('Deleting message', { messageId });

      // Mark as deleted instead of actually deleting
      const { error: updateError } = await db.update(collections.MESSAGES, messageId, {
        is_deleted: true,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        throw new MessagingServiceError(
          'MESSAGE_DELETE_FAILED',
          'Failed to delete message',
          updateError
        );
      }

      logger.info('Message deleted successfully');
    } catch (error) {
      logger.error('Failed to delete message', error);
      if (error instanceof MessagingServiceError) {
        throw error;
      }
      throw new MessagingServiceError('UNKNOWN_ERROR', 'Failed to delete message', error);
    }
  }

  /**
   * Get unread message count for a conversation
   */
  async getUnreadCount(conversationId: string): Promise<number> {
    try {
      const currentUser = this.getCurrentUser();

      // Check if user is participant in conversation
      await this.checkConversationPermission(conversationId, currentUser.id, 'member');

      // Get user's last read timestamp for this conversation
      const { data: participantData, error: participantError } = await db.list(
        collections.CONVERSATION_PARTICIPANTS,
        [
          queryHelpers.equal('conversation_id', conversationId),
          queryHelpers.equal('user_id', currentUser.id),
        ]
      );

      if (participantError || !participantData?.documents?.length) {
        return 0;
      }

      const participant = participantData.documents[0];
      const lastReadAt = participant.last_read_at;

      // Count messages after last read timestamp
      let messageQueries = [
        queryHelpers.equal('conversation_id', conversationId),
        queryHelpers.equal('is_deleted', false),
        queryHelpers.notEqual('sender_id', currentUser.id), // Don't count own messages
      ];

      if (lastReadAt) {
        messageQueries.push(queryHelpers.greaterThanEqualDate('created_at', lastReadAt));
      }

      const { data: messageData, error: messageError } = await db.list(collections.MESSAGES, [
        ...messageQueries,
        queryHelpers.limit(100), // Reasonable limit for counting
      ]);

      if (messageError) {
        logger.error('Failed to count unread messages', messageError);
        return 0;
      }

      return messageData?.documents?.length || 0;
    } catch (error) {
      logger.error('Failed to get unread count', error);
      return 0;
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(status: UserPresenceStatus): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      const presenceDoc: Omit<UserPresenceDocument, keyof Models.Document> = {
        user_id: currentUser.id,
        status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Try to update existing presence record
      const { data: existingPresence, error: existingError } = await db.list(
        collections.USER_PRESENCE,
        [queryHelpers.equal('user_id', currentUser.id)]
      );

      if (existingError || !existingPresence?.documents?.length) {
        // Create new presence record
        await db.create(collections.USER_PRESENCE, presenceDoc, ID.unique());
      } else {
        // Update existing record
        await db.update(collections.USER_PRESENCE, existingPresence.documents[0].$id, {
          status,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      logger.info('Presence updated successfully', { status });
    } catch (error) {
      logger.error('Failed to update presence', error);
    }
  }

  /**
   * Update typing indicator
   */
  async updateTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();

      const indicatorDoc: Omit<TypingIndicatorDocument, keyof Models.Document> = {
        conversation_id: conversationId,
        user_id: currentUser.id,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      };

      // Try to update existing indicator
      const { data: existingIndicator, error: existingError } = await db.list(
        collections.TYPING_INDICATORS,
        [
          queryHelpers.equal('conversation_id', conversationId),
          queryHelpers.equal('user_id', currentUser.id),
        ]
      );

      if (existingError || !existingIndicator?.documents?.length) {
        if (isTyping) {
          // Create new indicator only if typing
          await db.create(collections.TYPING_INDICATORS, indicatorDoc, ID.unique());
        }
      } else {
        if (isTyping) {
          // Update existing indicator
          await db.update(collections.TYPING_INDICATORS, existingIndicator.documents[0].$id, {
            is_typing: true,
            updated_at: new Date().toISOString(),
          });
        } else {
          // Delete indicator when not typing
          await db.delete(collections.TYPING_INDICATORS, existingIndicator.documents[0].$id);
        }
      }
    } catch (error) {
      logger.error('Failed to update typing indicator', error);
    }
  }

  /**
   * Upload message attachments
   */
  private async uploadMessageAttachments(messageId: string, files: File[]): Promise<any[]> {
    const attachments: any[] = [];

    for (const file of files) {
      try {
        // Determine bucket based on file type
        let bucketId: string;
        if (file.type.startsWith('audio/')) {
          bucketId = STORAGE_BUCKETS.VOICE_MESSAGES;
        } else {
          bucketId = STORAGE_BUCKETS.MESSAGE_ATTACHMENTS;
        }

        // Upload file to storage
        const { data: uploadResult, error: uploadError } = await storageService.uploadFile({
          file,
          bucketId,
          onProgress: (progress: number) => {
            logger.debug('Upload progress', { fileName: file.name, progress });
          },
        });

        if (uploadError || !uploadResult) {
          logger.error('Failed to upload attachment', { fileName: file.name, error: uploadError });
          continue;
        }

        // Create attachment document
        const attachmentDoc: Omit<MessageAttachmentDocument, keyof Models.Document> = {
          message_id: messageId,
          file_id: uploadResult.fileId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_url: storageService.getFileUrl(bucketId, uploadResult.fileId),
          duration: file.type.startsWith('audio/') ? undefined : undefined, // TODO: Extract audio duration
        };

        const { data: attachment, error: attachmentError } = await db.create(
          collections.MESSAGE_ATTACHMENTS,
          attachmentDoc,
          ID.unique()
        );

        if (attachmentError) {
          logger.error('Failed to create attachment document', attachmentError);
          continue;
        }

        attachments.push(attachment);
      } catch (error) {
        logger.error('Failed to process attachment', { fileName: file.name, error });
      }
    }

    return attachments;
  }

  /**
   * Check if user has permission for conversation
   */
  private async checkConversationPermission(
    conversationId: string,
    userId: string,
    requiredRole: 'admin' | 'member'
  ): Promise<void> {
    const { data: participantData, error } = await db.list(collections.CONVERSATION_PARTICIPANTS, [
      queryHelpers.equal('conversation_id', conversationId),
      queryHelpers.equal('user_id', userId),
      queryHelpers.equal('is_active', true),
    ]);

    if (error || !participantData?.documents?.length) {
      throw new MessagingServiceError(
        'ACCESS_DENIED',
        'User is not a participant in this conversation'
      );
    }

    const participant = participantData.documents[0];

    if (requiredRole === 'admin' && participant.role !== 'admin') {
      throw new MessagingServiceError('ACCESS_DENIED', 'Admin role required for this action');
    }
  }

  /**
   * Build conversation object from document
   */
  private async buildConversationFromDocument(
    doc: ConversationDocument,
    _currentUserId: string
  ): Promise<Conversation | null> {
    try {
      // Get participants
      const { data: participantData, error: participantError } = await db.list(
        collections.CONVERSATION_PARTICIPANTS,
        [queryHelpers.equal('conversation_id', doc.$id), queryHelpers.equal('is_active', true)]
      );

      if (participantError || !participantData?.documents?.length) {
        logger.error('Failed to get conversation participants', participantError);
        return null;
      }

      // Get user profiles for participants
      const participantPromises = participantData.documents.map(async (participant) => {
        const { data: userProfile } = await db.get(collections.USER_PROFILES, participant.user_id);

        // Get presence status
        const { data: presenceData } = await db.list(collections.USER_PRESENCE, [
          queryHelpers.equal('user_id', participant.user_id),
        ]);

        const presence = presenceData?.documents?.[0];
        const isOnline = presence?.status === 'online';

        return {
          userId: participant.user_id,
          userName: userProfile?.name || 'Unknown User',
          userAvatar: userProfile?.avatar_url,
          userRole: userProfile?.role || 'viewer',
          conversationRole: participant.role,
          joinedAt: new Date(participant.joined_at),
          lastReadAt: participant.last_read_at ? new Date(participant.last_read_at) : undefined,
          isOnline,
        } as ConversationParticipant;
      });

      const participants = await Promise.all(participantPromises);

      // Get last message
      const { data: lastMessageData, error: lastMessageError } = await db.list(
        collections.MESSAGES,
        [
          queryHelpers.equal('conversation_id', doc.$id),
          queryHelpers.equal('is_deleted', false),
          queryHelpers.orderDesc('created_at'),
          queryHelpers.limit(1),
        ]
      );

      let lastMessage: Message | undefined;
      if (!lastMessageError && lastMessageData?.documents?.length) {
        const builtMessage = await this.buildMessageFromDocument(lastMessageData.documents[0]);
        lastMessage = builtMessage || undefined;
      }

      // Get unread count
      const unreadCount = await this.getUnreadCount(doc.$id);

      const conversation: Conversation = {
        id: doc.$id,
        name: doc.name,
        type: doc.type,
        participants,
        lastMessage,
        lastMessageAt: doc.last_message_at ? new Date(doc.last_message_at) : undefined,
        unreadCount,
        createdBy: doc.created_by,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        isActive: doc.is_active,
      };

      return conversation;
    } catch (error) {
      logger.error('Failed to build conversation from document', error);
      return null;
    }
  }

  /**
   * Build message object from document
   */
  protected async buildMessageFromDocument(
    doc: MessageDocument,
    attachments: any[] = []
  ): Promise<Message | null> {
    try {
      // Get sender profile
      const { data: senderProfile, error: senderError } = await db.get(
        collections.USER_PROFILES,
        doc.sender_id
      );

      if (senderError) {
        logger.error('Failed to get sender profile', senderError);
        return null;
      }

      // Get attachments if not provided
      let messageAttachments = attachments;
      if (messageAttachments.length === 0) {
        const { data: attachmentData, error: attachmentError } = await db.list(
          collections.MESSAGE_ATTACHMENTS,
          [queryHelpers.equal('message_id', doc.$id)]
        );

        if (!attachmentError && attachmentData?.documents) {
          messageAttachments = attachmentData.documents;
        }
      }

      // Get read status
      const { data: readStatusData, error: readStatusError } = await db.list(
        collections.MESSAGE_READ_STATUS,
        [queryHelpers.equal('message_id', doc.$id)]
      );

      const readBy: MessageReadStatus[] = [];
      if (!readStatusError && readStatusData?.documents) {
        for (const readDoc of readStatusData.documents) {
          const { data: userProfile } = await db.get(collections.USER_PROFILES, readDoc.user_id);

          readBy.push({
            userId: readDoc.user_id,
            userName: userProfile?.name || 'Unknown User',
            readAt: new Date(readDoc.read_at),
          });
        }
      }

      // Get reply message if exists
      let replyTo: Message | undefined;
      if (doc.reply_to_message_id) {
        const { data: replyDoc } = await db.get<MessageDocument>(
          collections.MESSAGES,
          doc.reply_to_message_id
        );

        if (replyDoc) {
          const builtReply = await this.buildMessageFromDocument(replyDoc);
          replyTo = builtReply || undefined;
        }
      }

      const message: Message = {
        id: doc.$id,
        conversationId: doc.conversation_id,
        senderId: doc.sender_id,
        senderName: senderProfile?.name || 'Unknown User',
        senderAvatar: senderProfile?.avatar_url,
        content: doc.content,
        type: doc.type,
        attachments: messageAttachments.map((att) => ({
          id: att.$id,
          messageId: att.message_id,
          fileId: att.file_id,
          fileName: att.file_name,
          fileType: att.file_type,
          fileSize: att.file_size,
          fileUrl: att.file_url,
          thumbnailUrl: att.thumbnail_url,
          duration: att.duration,
        })),
        replyTo,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
        isDeleted: doc.is_deleted,
        readBy,
      };

      return message;
    } catch (error) {
      logger.error('Failed to build message from document', error);
      return null;
    }
  }
}

// Export singleton instance
export const messagingService = MessagingService.getInstance();

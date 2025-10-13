/**
 * @fileoverview Appwrite Messaging Service
 * @description Appwrite ile entegre mesajlaşma servisi
 */

import { databases, storage, ID, Query } from '../lib/appwrite';
import { DATABASE_ID } from '../lib/appwrite';
import { logger } from '../lib/logging/logger';
import type {
  Conversation,
  Message,
  CreateConversationData,
  SendMessageData,
  MessageFilters,
  MessageAttachment,
} from '../types/messaging';

export class AppwriteMessagingService {
  private static instance: AppwriteMessagingService;

  private constructor() {
    this.initializeRealtime();
  }

  public static getInstance(): AppwriteMessagingService {
    if (!AppwriteMessagingService.instance) {
      AppwriteMessagingService.instance = new AppwriteMessagingService();
    }
    return AppwriteMessagingService.instance;
  }

  /**
   * Gerçek zamanlı bağlantıyı başlat
   */
  private initializeRealtime(): void {
    try {
      // Appwrite Realtime bağlantısı otomatik olarak client tarafından yönetilir
      logger.info('Appwrite Messaging Service initialized');
    } catch (error) {
      logger.error('Failed to initialize messaging service:', error);
    }
  }

  // =============================================================================
  // CONVERSATION OPERATIONS
  // =============================================================================

  /**
   * Yeni konuşma oluştur
   */
  async createConversation(data: CreateConversationData): Promise<Conversation> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      const conversationId = ID.unique();

      // Konuşma oluştur
      const conversation = await databases.createDocument(
        DATABASE_ID,
        'conversations',
        conversationId,
        {
          name: data.name || '',
          type: data.type,
          created_by: data.createdBy,
          avatar_url: data.avatarUrl || '',
          is_active: true,
        }
      );

      // Katılımcıları ekle
      if (data.participantIds && data.participantIds.length > 0) {
        await this.addParticipantsToConversation(conversationId, data.participantIds);
      }

      logger.info('Conversation created successfully', { conversationId });

      return this.mapConversationFromAppwrite(conversation);
    } catch (error) {
      logger.error('Failed to create conversation:', error);
      throw new Error('Konuşma oluşturulamadı');
    }
  }

  /**
   * Konuşmaları listele
   */
  async getConversations(userId: string, limit = 50, offset = 0): Promise<Conversation[]> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      // Kullanıcının katıldığı konuşmaları getir
      const participants = await databases.listDocuments(DATABASE_ID, 'conversation_participants', [
        Query.equal('user_id', userId),
        Query.limit(limit),
        Query.offset(offset),
      ]);

      if (!participants.documents.length) {
        return [];
      }

      const conversationIds = participants.documents.map((p) => p.conversation_id);

      const conversations = await databases.listDocuments(DATABASE_ID, 'conversations', [
        Query.equal('$id', conversationIds),
        Query.equal('is_active', true),
      ]);

      return conversations.documents.map((conv) => this.mapConversationFromAppwrite(conv));
    } catch (error) {
      logger.error('Failed to get conversations:', error);
      throw new Error('Konuşmalar yüklenemedi');
    }
  }

  /**
   * Konuşma detaylarını getir
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      const conversation = await databases.getDocument(
        DATABASE_ID,
        'conversations',
        conversationId
      );

      return this.mapConversationFromAppwrite(conversation);
    } catch (error) {
      logger.error('Failed to get conversation:', error);
      return null;
    }
  }

  /**
   * Konuşmaya katılımcı ekle
   */
  async addParticipantsToConversation(conversationId: string, userIds: string[]): Promise<void> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      for (const userId of userIds) {
        await databases.createDocument(DATABASE_ID, 'conversation_participants', ID.unique(), {
          conversation_id: conversationId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          role: 'member',
        });
      }

      logger.info('Participants added to conversation', { conversationId, userIds });
    } catch (error) {
      logger.error('Failed to add participants:', error);
      throw new Error('Katılımcılar eklenemedi');
    }
  }

  // =============================================================================
  // MESSAGE OPERATIONS
  // =============================================================================

  /**
   * Mesaj gönder
   */
  async sendMessage(data: SendMessageData): Promise<Message> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      const messageId = ID.unique();

      // Mesaj oluştur
      const message = await databases.createDocument(DATABASE_ID, 'messages', messageId, {
        conversation_id: data.conversationId,
        sender_id: data.senderId,
        content: data.content || '',
        type: data.type,
        reply_to: data.replyTo || null,
        is_edited: false,
        is_deleted: false,
      });

      // Dosya ekleri varsa işle
      if (data.attachments && data.attachments.length > 0) {
        await this.handleMessageAttachments(messageId, data.attachments);
      }

      logger.info('Message sent successfully', { messageId });

      return this.mapMessageFromAppwrite(message);
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw new Error('Mesaj gönderilemedi');
    }
  }

  /**
   * Mesajları getir
   */
  async getMessages(filters: MessageFilters): Promise<Message[]> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      const queries = [
        Query.equal('conversation_id', filters.conversationId),
        Query.equal('is_deleted', false),
        Query.orderDesc('$createdAt'),
        Query.limit(filters.limit || 50),
        Query.offset(filters.offset || 0),
      ];

      if (filters.senderId) {
        queries.push(Query.equal('sender_id', filters.senderId));
      }

      if (filters.type) {
        queries.push(Query.equal('type', filters.type));
      }

      const messages = await databases.listDocuments(DATABASE_ID, 'messages', queries);

      return messages.documents.map((msg) => this.mapMessageFromAppwrite(msg));
    } catch (error) {
      logger.error('Failed to get messages:', error);
      throw new Error('Mesajlar yüklenemedi');
    }
  }

  /**
   * Mesaj sil
   */
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      // Mesajın sahibi kontrolü
      const message = await databases.getDocument(DATABASE_ID, 'messages', messageId);

      if (message.sender_id !== userId) {
        throw new Error('Bu mesajı silme yetkiniz yok');
      }

      // Mesajı sil (soft delete)
      await databases.updateDocument(DATABASE_ID, 'messages', messageId, {
        is_deleted: true,
        content: '[Bu mesaj silindi]',
      });

      logger.info('Message deleted successfully', { messageId });
      return true;
    } catch (error) {
      logger.error('Failed to delete message:', error);
      throw new Error('Mesaj silinemedi');
    }
  }

  // =============================================================================
  // FILE ATTACHMENT OPERATIONS
  // =============================================================================

  /**
   * Mesaj eklerini işle
   */
  private async handleMessageAttachments(messageId: string, files: File[]): Promise<void> {
    try {
      if (!storage || !databases) {
        throw new Error('Storage or databases service is not initialized');
      }

      for (const file of files) {
        const attachmentId = ID.unique();

        // Dosyayı storage'a yükle
        const bucketId = this.getBucketForFileType(file.type);
        const uploadedFile = await storage.createFile(bucketId, attachmentId, file);

        // Attachment kaydını oluştur
        await databases.createDocument(DATABASE_ID, 'message_attachments', ID.unique(), {
          message_id: messageId,
          file_id: uploadedFile.$id,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          bucket_id: bucketId,
        });
      }

      logger.info('Message attachments processed', { messageId, fileCount: files.length });
    } catch (error) {
      logger.error('Failed to handle message attachments:', error);
      throw new Error('Dosya ekleri işlenemedi');
    }
  }

  /**
   * Dosya türüne göre bucket seç
   */
  private getBucketForFileType(mimeType: string): string {
    if (mimeType.startsWith('audio/')) {
      return 'voice_messages';
    }
    return 'message_attachments';
  }

  /**
   * Mesaj eklerini getir
   */
  async getMessageAttachments(messageId: string): Promise<MessageAttachment[]> {
    try {
      if (!databases || !storage) {
        throw new Error('Databases or storage service is not initialized');
      }

      const attachments = await databases.listDocuments(DATABASE_ID, 'message_attachments', [
        Query.equal('message_id', messageId),
      ]);

      return attachments.documents.map((att) => ({
        id: att.$id,
        messageId: att.message_id,
        fileId: att.file_id,
        fileName: att.file_name,
        fileSize: att.file_size,
        fileType: att.file_type,
        bucketId: att.bucket_id,
        fileUrl: storage?.getFileView(att.bucket_id, att.file_id).toString() || '',
        createdAt: new Date(att.$createdAt),
      }));
    } catch (error) {
      logger.error('Failed to get message attachments:', error);
      return [];
    }
  }

  // =============================================================================
  // REALTIME FEATURES
  // =============================================================================

  /**
   * Kullanıcı durumunu güncelle
   */
  async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      await databases.createDocument(DATABASE_ID, 'user_presence', ID.unique(), {
        user_id: userId,
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      });

      logger.info('User presence updated', { userId, isOnline });
    } catch (error) {
      logger.error('Failed to update user presence:', error);
    }
  }

  /**
   * Yazıyor durumunu güncelle
   */
  async setTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      if (isTyping) {
        await databases.createDocument(DATABASE_ID, 'typing_indicators', ID.unique(), {
          conversation_id: conversationId,
          user_id: userId,
          is_typing: true,
        });
      } else {
        // Mevcut typing indicator'ı sil
        const existing = await databases.listDocuments(DATABASE_ID, 'typing_indicators', [
          Query.equal('conversation_id', conversationId),
          Query.equal('user_id', userId),
        ]);

        for (const indicator of existing.documents) {
          await databases.deleteDocument(DATABASE_ID, 'typing_indicators', indicator.$id);
        }
      }

      logger.info('Typing indicator updated', { conversationId, userId, isTyping });
    } catch (error) {
      logger.error('Failed to update typing indicator:', error);
    }
  }

  /**
   * Mesaj okundu durumunu güncelle
   */
  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      if (!databases) {
        throw new Error('Databases service is not initialized');
      }

      await databases.createDocument(DATABASE_ID, 'message_read_status', ID.unique(), {
        message_id: messageId,
        user_id: userId,
        read_at: new Date().toISOString(),
      });

      logger.info('Message marked as read', { messageId, userId });
    } catch (error) {
      logger.error('Failed to mark message as read:', error);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Appwrite conversation'ını Conversation tipine dönüştür
   */
  private mapConversationFromAppwrite(doc: any): Conversation {
    return {
      id: doc.$id,
      name: doc.name,
      type: doc.type,
      participants: [], // Bu gerçek implementasyonda doldurulmalı
      unreadCount: 0,
      createdBy: doc.created_by,
      isActive: doc.is_active,
      createdAt: new Date(doc.$createdAt),
      updatedAt: new Date(doc.$updatedAt),
    };
  }

  /**
   * Appwrite message'ını Message tipine dönüştür
   */
  private mapMessageFromAppwrite(doc: any): Message {
    return {
      id: doc.$id,
      conversationId: doc.conversation_id,
      senderId: doc.sender_id,
      senderName: '', // Bu gerçek implementasyonda doldurulmalı
      content: doc.content,
      type: doc.type,
      attachments: [], // Bu gerçek implementasyonda doldurulmalı
      replyTo: doc.reply_to ? ({ id: doc.reply_to } as Message) : undefined,
      isDeleted: doc.is_deleted,
      createdAt: new Date(doc.$createdAt),
      updatedAt: new Date(doc.$updatedAt),
      readBy: [], // Bu gerçek implementasyonda doldurulmalı
    };
  }
}

// Singleton instance
export const appwriteMessagingService = AppwriteMessagingService.getInstance();

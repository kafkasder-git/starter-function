/**
 * @fileoverview Messaging Hook
 * @description Hook for messaging operations and state management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { messagingService } from '@/services/messagingService';
import { logger } from '@/lib/logging/logger';
import { toast } from 'sonner';
import type {
  Conversation,
  Message,
  CreateConversationData,
  SendMessageData,
  MessageFilters,
  ConversationFilters,
  UseMessagingReturn,
  ConversationType,
  MessageType
} from '@/types/messaging';

interface UseMessagingOptions {
  autoLoadConversations?: boolean;
  autoLoadMessages?: boolean;
  messageLimit?: number;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

/**
 * Hook for messaging operations
 */
export function useMessaging(options: UseMessagingOptions = {}): UseMessagingReturn {
  const {
    autoLoadConversations = true,
    autoLoadMessages = true,
    messageLimit = 50,
    onError,
    onSuccess
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for pagination
  const messagesOffsetRef = useRef(0);
  const hasMoreMessagesRef = useRef(true);
  const isLoadingMessagesRef = useRef(false);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Handle error
   */
  const handleError = useCallback((err: any, defaultMessage: string) => {
    const errorMessage = err?.message || defaultMessage;
    setError(errorMessage);
    onError?.(errorMessage);
    toast.error(errorMessage);
    logger.error(defaultMessage, err);
  }, [onError]);

  /**
   * Handle success
   */
  const handleSuccess = useCallback((message: string) => {
    onSuccess?.(message);
    toast.success(message);
  }, [onSuccess]);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(async (data: CreateConversationData): Promise<Conversation> => {
    try {
      setLoading(true);
      clearError();

      if (!isAuthenticated || !user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Validate input
      if (!data.participantIds || data.participantIds.length === 0) {
        throw new Error('En az bir katılımcı seçmelisiniz');
      }

      if (data.type === 'group' && (!data.name || data.name.trim().length === 0)) {
        throw new Error('Grup adı gereklidir');
      }

      // Check if it's a direct conversation with only one other user
      if (data.type === 'direct' && data.participantIds.length > 1) {
        throw new Error('Doğrudan mesajlaşma için sadece bir kişi seçebilirsiniz');
      }

      // Check if direct conversation already exists
      if (data.type === 'direct') {
        const existingConversations = await messagingService.getConversations({
          userId: user.id,
          type: 'direct'
        });

        const existingDirect = existingConversations.find(conv => 
          conv.type === 'direct' && 
          conv.participants.length === 2 &&
          conv.participants.some(p => data.participantIds.includes(p.userId))
        );

        if (existingDirect) {
          setSelectedConversation(existingDirect.id);
          handleSuccess('Mevcut konuşma açıldı');
          return existingDirect;
        }
      }

      const conversation = await messagingService.createConversation(data);

      // Add to conversations list
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation.id);

      const successMessage = data.type === 'group' 
        ? `Grup "${data.name}" oluşturuldu` 
        : 'Konuşma oluşturuldu';
      
      handleSuccess(successMessage);
      
      return conversation;

    } catch (err) {
      handleError(err, 'Konuşma oluşturulamadı');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, handleError, handleSuccess, clearError]);

  /**
   * Load conversations
   */
  const loadConversations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      if (!isAuthenticated || !user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      const userConversations = await messagingService.getConversations({
        userId: user.id
      });

      setConversations(userConversations);

    } catch (err) {
      handleError(err, 'Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, handleError, clearError]);

  /**
   * Get conversation by ID
   */
  const getConversationById = useCallback(async (id: string): Promise<Conversation | null> => {
    try {
      const conversation = await messagingService.getConversationById(id);
      return conversation;
    } catch (err) {
      handleError(err, 'Konuşma bulunamadı');
      return null;
    }
  }, [handleError]);

  /**
   * Add participants to conversation
   */
  const addParticipants = useCallback(async (conversationId: string, userIds: string[]): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      if (!userIds || userIds.length === 0) {
        throw new Error('Katılımcı seçmelisiniz');
      }

      await messagingService.addParticipants(conversationId, userIds);

      // Reload conversations to get updated data
      await loadConversations();

      handleSuccess(`${userIds.length} katılımcı eklendi`);

    } catch (err) {
      handleError(err, 'Katılımcılar eklenemedi');
    } finally {
      setLoading(false);
    }
  }, [loadConversations, handleError, handleSuccess, clearError]);

  /**
   * Remove participant from conversation
   */
  const removeParticipant = useCallback(async (conversationId: string, userId: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await messagingService.removeParticipant(conversationId, userId);

      // Reload conversations to get updated data
      await loadConversations();

      handleSuccess('Katılımcı kaldırıldı');

    } catch (err) {
      handleError(err, 'Katılımcı kaldırılamadı');
    } finally {
      setLoading(false);
    }
  }, [loadConversations, handleError, handleSuccess, clearError]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (data: SendMessageData): Promise<Message> => {
    try {
      if (!selectedConversation) {
        throw new Error('Konuşma seçilmedi');
      }

      if (!isAuthenticated || !user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Validate message content
      if (data.type === 'text' && (!data.content || data.content.trim().length === 0)) {
        throw new Error('Mesaj içeriği boş olamaz');
      }

      if (data.type === 'file' && (!data.attachments || data.attachments.length === 0)) {
        throw new Error('Dosya seçmelisiniz');
      }

      if (data.type === 'voice' && (!data.attachments || data.attachments.length === 0)) {
        throw new Error('Sesli mesaj kaydı bulunamadı');
      }

      const messageData: SendMessageData = {
        ...data,
        conversationId: selectedConversation
      };

      const message = await messagingService.sendMessage(messageData);

      // Add message to local state
      setMessages(prev => [message, ...prev]);

      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { 
              ...conv, 
              lastMessage: message, 
              lastMessageAt: message.createdAt,
              unreadCount: 0 // Reset unread count for current user
            }
          : conv
      ));

      return message;

    } catch (err) {
      handleError(err, 'Mesaj gönderilemedi');
      throw err;
    }
  }, [selectedConversation, isAuthenticated, user, handleError]);

  /**
   * Load messages for selected conversation
   */
  const loadMessages = useCallback(async (conversationId?: string, limit?: number, offset?: number): Promise<void> => {
    try {
      const targetConversationId = conversationId || selectedConversation;
      if (!targetConversationId) {
        return;
      }

      setLoading(true);
      clearError();

      const filters: MessageFilters = {
        conversationId: targetConversationId,
        limit: limit || messageLimit,
        offset: offset || 0
      };

      const conversationMessages = await messagingService.getMessages(filters);

      if (offset && offset > 0) {
        // Append older messages for pagination
        setMessages(prev => [...prev, ...conversationMessages]);
      } else {
        // Replace messages for new conversation or refresh
        setMessages(conversationMessages);
      }

      // Update pagination refs
      messagesOffsetRef.current = offset || 0;
      hasMoreMessagesRef.current = conversationMessages.length === (limit || messageLimit);

      // Mark messages as read
      if (conversationMessages.length > 0 && targetConversationId === selectedConversation) {
        const latestMessage = conversationMessages[0];
        await messagingService.markAsRead(latestMessage.id);
      }

    } catch (err) {
      handleError(err, 'Mesajlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [selectedConversation, messageLimit, handleError, clearError]);

  /**
   * Load more messages (pagination)
   */
  const loadMoreMessages = useCallback(async (): Promise<void> => {
    if (!selectedConversation || isLoadingMessagesRef.current || !hasMoreMessagesRef.current) {
      return;
    }

    try {
      isLoadingMessagesRef.current = true;
      const nextOffset = messagesOffsetRef.current + messageLimit;
      
      await loadMessages(selectedConversation, messageLimit, nextOffset);
      
    } catch (err) {
      handleError(err, 'Eski mesajlar yüklenemedi');
    } finally {
      isLoadingMessagesRef.current = false;
    }
  }, [selectedConversation, messageLimit, loadMessages, handleError]);

  /**
   * Mark message as read
   */
  const markAsRead = useCallback(async (messageId: string): Promise<void> => {
    try {
      await messagingService.markAsRead(messageId);

      // Update local message read status
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, readBy: [...msg.readBy, { userId: user!.id, userName: user!.name, readAt: new Date() }] }
          : msg
      ));

    } catch (err) {
      logger.error('Failed to mark message as read', err);
    }
  }, [user]);

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      await messagingService.deleteMessage(messageId);

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      handleSuccess('Mesaj silindi');

    } catch (err) {
      handleError(err, 'Mesaj silinemedi');
    } finally {
      setLoading(false);
    }
  }, [handleError, handleSuccess, clearError]);

  /**
   * Get unread message count for a conversation
   */
  const getUnreadCount = useCallback(async (conversationId: string): Promise<number> => {
    try {
      return await messagingService.getUnreadCount(conversationId);
    } catch (err) {
      logger.error('Failed to get unread count', err);
      return 0;
    }
  }, []);

  /**
   * Add message to local state (for realtime updates)
   */
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) {
        return prev;
      }

      return [message, ...prev];
    });

    // Update conversation's last message
    setConversations(prev => prev.map(conv => 
      conv.id === message.conversationId 
        ? { 
            ...conv, 
            lastMessage: message, 
            lastMessageAt: message.createdAt,
            unreadCount: message.senderId !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
          }
        : conv
    ));
  }, [user]);

  /**
   * Update message read status (for realtime updates)
   */
  const updateMessageReadStatus = useCallback((messageId: string, readStatus: { userId: string; userName: string; readAt: Date }) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { 
            ...msg, 
            readBy: [...msg.readBy.filter(r => r.userId !== readStatus.userId), readStatus]
          }
        : msg
    ));
  }, []);

  /**
   * Auto-load conversations on mount
   */
  useEffect(() => {
    if (autoLoadConversations && isAuthenticated && user) {
      loadConversations();
    }
  }, [autoLoadConversations, isAuthenticated, user, loadConversations]);

  /**
   * Auto-load messages when conversation is selected
   */
  useEffect(() => {
    if (autoLoadMessages && selectedConversation) {
      // Reset pagination
      messagesOffsetRef.current = 0;
      hasMoreMessagesRef.current = true;
      loadMessages();
    }
  }, [selectedConversation, autoLoadMessages, loadMessages]);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    
    // Conversation operations
    createConversation,
    loadConversations,
    getConversationById,
    addParticipants,
    removeParticipant,
    
    // Message operations
    sendMessage,
    loadMessages,
    loadMoreMessages,
    markAsRead,
    deleteMessage,
    getUnreadCount,
    
    // Realtime helpers
    addMessage,
    updateMessageReadStatus,
    
    // UI state
    setSelectedConversation,
    clearError
  };
}

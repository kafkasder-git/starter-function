/**
 * @fileoverview Appwrite Messaging Hook
 * @description Hook for Appwrite-based messaging operations
 */

import { useCallback, useEffect } from 'react';
import { appwriteMessagingService } from '@/services/appwriteMessagingService';
import { logger } from '@/lib/logging/logger';
import { useMessagingBase, type MessagingHookOptions } from './useMessagingBase';

type UseAppwriteMessagingOptions = MessagingHookOptions;

/**
 * Hook for Appwrite messaging operations
 */
export function useAppwriteMessaging(options: UseAppwriteMessagingOptions = {}) {
  const {
    user,
    isAuthenticated,
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
    loading,
    setLoading,
    error,
    clearError,
    handleError,
    handleSuccess,
    options: { autoLoadConversations, autoLoadMessages, messageLimit },
  } = useMessagingBase(options);
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

      const userConversations = await appwriteMessagingService.getUserConversations(user.id);
      setConversations(userConversations);
    } catch (err) {
      handleError(err, 'Konuşmalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, handleError, clearError, setLoading, setConversations]);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(
    async (name: string, participants: string[], isGroup = false): Promise<string> => {
      try {
        setLoading(true);
        clearError();

        if (!isAuthenticated || !user) {
          throw new Error('Kullanıcı oturumu bulunamadı');
        }

        if (!participants || participants.length === 0) {
          throw new Error('En az bir katılımcı seçmelisiniz');
        }

        if (isGroup && (!name || name.trim().length === 0)) {
          throw new Error('Grup adı gereklidir');
        }

        const conversationId = await appwriteMessagingService.createConversation(
          name,
          participants,
          isGroup
        );

        // Reload conversations
        await loadConversations();

        const successMessage = isGroup ? `Grup "${name}" oluşturuldu` : 'Konuşma oluşturuldu';

        handleSuccess(successMessage);

        return conversationId;
      } catch (err) {
        handleError(err, 'Konuşma oluşturulamadı');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, user, handleError, handleSuccess, clearError, setLoading, loadConversations]
  );

  /**
   * Load messages for a conversation
   */
  const loadMessages = useCallback(
    async (conversationId: string, limit: number = messageLimit, offset = 0): Promise<void> => {
      try {
        setLoading(true);
        clearError();

        const conversationMessages = await appwriteMessagingService.getConversationMessages(
          conversationId,
          limit,
          offset
        );

        if (offset > 0) {
          // Append older messages for pagination
          setMessages((prev) => [...prev, ...conversationMessages]);
        } else {
          // Replace messages for new conversation or refresh
          setMessages(conversationMessages);
        }
      } catch (err) {
        handleError(err, 'Mesajlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    },
    [messageLimit, handleError, clearError, setLoading, setMessages]
  );

  /**
   * Send a message
   */
  const sendMessage = useCallback(
    async (conversationId: string, content: string, attachments?: File[]): Promise<string> => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error('Kullanıcı oturumu bulunamadı');
        }

        if (!content || content.trim().length === 0) {
          throw new Error('Mesaj içeriği boş olamaz');
        }

        const messageId = await appwriteMessagingService.sendMessage(
          conversationId,
          content,
          user.id,
          user.name || user.email,
          attachments
        );

        // Reload messages for the conversation
        await loadMessages(conversationId);

        return messageId;
      } catch (err) {
        handleError(err, 'Mesaj gönderilemedi');
        throw err;
      }
    },
    [isAuthenticated, user, handleError, loadMessages]
  );

  /**
   * Mark message as read
   */
  const markAsRead = useCallback(async (messageId: string): Promise<void> => {
    try {
      await appwriteMessagingService.markMessageAsRead(messageId);
    } catch (err) {
      logger.error('Failed to mark message as read', err);
    }
  }, []);

  /**
   * Join a conversation
   */
  const joinConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error('Kullanıcı oturumu bulunamadı');
        }

        await appwriteMessagingService.joinConversation(conversationId, user.id);
        handleSuccess('Konuşmaya katıldınız');
      } catch (err) {
        handleError(err, 'Konuşmaya katılamadı');
      }
    },
    [isAuthenticated, user, handleError, handleSuccess]
  );

  /**
   * Leave a conversation
   */
  const leaveConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      try {
        if (!isAuthenticated || !user) {
          throw new Error('Kullanıcı oturumu bulunamadı');
        }

        await appwriteMessagingService.leaveConversation(conversationId, user.id);
        handleSuccess('Konuşmadan ayrıldınız');

        // Reload conversations
        await loadConversations();
      } catch (err) {
        handleError(err, 'Konuşmadan ayrılamadı');
      }
    },
    [isAuthenticated, user, handleError, handleSuccess, loadConversations]
  );

  /**
   * Upload file attachment
   */
  const uploadAttachment = useCallback(
    async (file: File): Promise<string> => {
      try {
        return await appwriteMessagingService.uploadAttachment(file);
      } catch (err) {
        handleError(err, 'Dosya yüklenemedi');
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Get file download URL
   */
  const getFileDownloadUrl = useCallback(
    async (fileId: string): Promise<string> => {
      try {
        return await appwriteMessagingService.getFileDownloadUrl(fileId);
      } catch (err) {
        handleError(err, 'Dosya indirilemedi');
        throw err;
      }
    },
    [handleError]
  );

  /**
   * Delete a message
   */
  const deleteMessage = useCallback(
    async (messageId: string): Promise<void> => {
      try {
        setLoading(true);
        clearError();

        await appwriteMessagingService.deleteMessage(messageId);

        // Remove from local state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        handleSuccess('Mesaj silindi');
      } catch (err) {
        handleError(err, 'Mesaj silinemedi');
      } finally {
        setLoading(false);
      }
    },
    [handleError, handleSuccess, clearError, setLoading, setMessages]
  );

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string): Promise<void> => {
      try {
        setLoading(true);
        clearError();

        await appwriteMessagingService.deleteConversation(conversationId);

        // Remove from local state
        setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

        if (selectedConversation === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
        }

        handleSuccess('Konuşma silindi');
      } catch (err) {
        handleError(err, 'Konuşma silinemedi');
      } finally {
        setLoading(false);
      }
    },
    [
      selectedConversation,
      handleError,
      handleSuccess,
      clearError,
      setLoading,
      setConversations,
      setMessages,
      setSelectedConversation,
    ]
  );

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
      loadMessages(selectedConversation);
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
    joinConversation,
    leaveConversation,
    deleteConversation,

    // Message operations
    sendMessage,
    loadMessages,
    markAsRead,
    deleteMessage,

    // File operations
    uploadAttachment,
    getFileDownloadUrl,

    // UI state
    setSelectedConversation,
    clearError,
  };
}

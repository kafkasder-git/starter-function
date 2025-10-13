/**
 * @fileoverview Realtime Messaging Hook
 * @description Hook for real-time messaging subscriptions and state management
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { realtimeMessagingService } from '@/services/realtimeMessagingService';
import { logger } from '@/lib/logging/logger';
import type {
  TypingIndicator,
  UserPresence,
  MessageReadStatus,
  Message,
  UserPresenceStatus,
  UseRealtimeMessagingReturn,
  ConversationCallbacks
} from '@/types/messaging';

interface UseRealtimeMessagingOptions {
  autoConnect?: boolean;
  reconnectOnFocus?: boolean;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for real-time messaging features
 */
export function useRealtimeMessaging(options: UseRealtimeMessagingOptions = {}): UseRealtimeMessagingReturn {
  const {
    autoConnect = true,
    reconnectOnFocus = true,
    onConnectionChange,
    onError
  } = options;

  const { user, isAuthenticated } = useAuthStore();
  
  // State
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  // Refs
  const conversationSubscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const presenceSubscriptionsRef = useRef<Map<string[], () => void>>(new Map());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const connectionInitializedRef = useRef(false);

  /**
   * Handle connection state changes
   */
  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    onConnectionChange?.(connected);
    
    if (connected) {
      logger.info('Realtime connection established');
    } else {
      logger.warn('Realtime connection lost');
    }
  }, [onConnectionChange]);

  /**
   * Handle errors
   */
  const handleError = useCallback((error: string) => {
    onError?.(error);
    logger.error('Realtime messaging error', error);
  }, [onError]);

  /**
   * Update user presence
   */
  const updatePresence = useCallback(async (status: UserPresenceStatus): Promise<void> => {
    try {
      if (!isAuthenticated || !user) {
        return;
      }

      await realtimeMessagingService.updatePresence(status);
      
      // Update local presence state
      setOnlineUsers(prev => {
        const updated = new Map(prev);
        updated.set(user.id, {
          userId: user.id,
          status,
          lastSeen: new Date()
        });
        return updated;
      });

    } catch (error) {
      handleError('Presence güncellenemedi');
    }
  }, [isAuthenticated, user, handleError]);

  /**
   * Set typing indicator
   */
  const setTyping = useCallback(async (conversationId: string, isTyping: boolean): Promise<void> => {
    try {
      if (!isAuthenticated || !user) {
        return;
      }

      await realtimeMessagingService.updateTypingIndicator(conversationId, isTyping);

      // Update local typing state
      if (isTyping) {
        setTypingUsers(prev => {
          const existing = prev.find(t => t.conversationId === conversationId && t.userId === user.id);
          if (existing) {
            return prev.map(t => 
              t.conversationId === conversationId && t.userId === user.id
                ? { ...t, isTyping: true, updatedAt: new Date() }
                : t
            );
          }

          return [...prev, {
            conversationId,
            userId: user.id,
            userName: user.name,
            isTyping: true,
            updatedAt: new Date()
          }];
        });

        // Set timeout to remove typing indicator
        const timeoutId = setTimeout(() => {
          setTyping(conversationId, false);
        }, 3000); // Remove after 3 seconds

        // Clear existing timeout
        const existingTimeout = typingTimeoutRef.current.get(conversationId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        typingTimeoutRef.current.set(conversationId, timeoutId);

      } else {
        // Remove typing indicator
        setTypingUsers(prev => prev.filter(t => 
          !(t.conversationId === conversationId && t.userId === user.id)
        ));

        // Clear timeout
        const timeoutId = typingTimeoutRef.current.get(conversationId);
        if (timeoutId) {
          clearTimeout(timeoutId);
          typingTimeoutRef.current.delete(conversationId);
        }
      }

    } catch (error) {
      handleError('Typing durumu güncellenemedi');
    }
  }, [isAuthenticated, user, handleError]);

  /**
   * Subscribe to conversation events
   */
  const subscribeToConversation = useCallback((conversationId: string, callbacks: ConversationCallbacks): () => void => {
    try {
      logger.info('Subscribing to conversation events', { conversationId });

      // Unsubscribe from existing subscription for this conversation
      const existingUnsubscribe = conversationSubscriptionsRef.current.get(conversationId);
      if (existingUnsubscribe) {
        existingUnsubscribe();
      }

      // Create new subscription
      const unsubscribe = realtimeMessagingService.subscribeToConversation(conversationId, {
        onMessage: (message: Message) => {
          callbacks.onMessage(message);
        },
        onTyping: (indicator: TypingIndicator) => {
          // Update typing users state
          setTypingUsers(prev => {
            const filtered = prev.filter(t => 
              !(t.conversationId === indicator.conversationId && t.userId === indicator.userId)
            );

            if (indicator.isTyping) {
              return [...filtered, indicator];
            }

            return filtered;
          });

          callbacks.onTyping(indicator);
        },
        onReadStatus: (readStatus: MessageReadStatus) => {
          callbacks.onReadStatus(readStatus);
        }
      });

      // Store subscription
      conversationSubscriptionsRef.current.set(conversationId, unsubscribe);

      return () => {
        unsubscribe();
        conversationSubscriptionsRef.current.delete(conversationId);
        logger.info('Unsubscribed from conversation events', { conversationId });
      };

    } catch (error) {
      handleError('Konuşma aboneliği oluşturulamadı');
      return () => {}; // Return empty function
    }
  }, [handleError]);

  /**
   * Subscribe to user presence updates
   */
  const subscribeToPresence = useCallback((userIds: string[]): () => void => {
    try {
      if (!userIds || userIds.length === 0) {
        return () => {};
      }

      logger.info('Subscribing to presence updates', { userIds });

      // Unsubscribe from existing presence subscription
      const existingUnsubscribe = presenceSubscriptionsRef.current.get(userIds);
      if (existingUnsubscribe) {
        existingUnsubscribe();
      }

      // Create new subscription
      const unsubscribe = realtimeMessagingService.subscribeToPresence(userIds, (presence: UserPresence) => {
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          updated.set(presence.userId, presence);
          return updated;
        });
      });

      // Store subscription
      presenceSubscriptionsRef.current.set(userIds, unsubscribe);

      return () => {
        unsubscribe();
        presenceSubscriptionsRef.current.delete(userIds);
        logger.info('Unsubscribed from presence updates', { userIds });
      };

    } catch (error) {
      handleError('Presence aboneliği oluşturulamadı');
      return () => {}; // Return empty function
    }
  }, [handleError]);

  /**
   * Initialize realtime connection
   */
  const initializeConnection = useCallback(() => {
    if (!isAuthenticated || !user || connectionInitializedRef.current) {
      return;
    }

    try {
      logger.info('Initializing realtime messaging connection');

      // Set global callbacks
      realtimeMessagingService.setGlobalCallbacks({
        onMessage: (message: Message) => {
          logger.debug('Global message received', { messageId: message.id });
        },
        onTyping: (indicator: TypingIndicator) => {
          logger.debug('Global typing indicator received', { indicator });
        },
        onReadStatus: (readStatus: MessageReadStatus) => {
          logger.debug('Global read status received', { readStatus });
        },
        onPresenceChange: (presence: UserPresence) => {
          logger.debug('Global presence change received', { presence });
        },
        onConnectionChange: (connected: boolean) => {
          handleConnectionChange(connected);
        }
      });

      // Set initial presence status
      updatePresence('online');

      connectionInitializedRef.current = true;
      logger.info('Realtime messaging connection initialized');

    } catch (error) {
      handleError('Realtime bağlantısı başlatılamadı');
    }
  }, [isAuthenticated, user, handleConnectionChange, updatePresence, handleError]);

  /**
   * Cleanup all subscriptions
   */
  const cleanup = useCallback(() => {
    logger.info('Cleaning up realtime messaging subscriptions');

    // Clean up conversation subscriptions
    for (const [conversationId, unsubscribe] of conversationSubscriptionsRef.current) {
      unsubscribe();
    }
    conversationSubscriptionsRef.current.clear();

    // Clean up presence subscriptions
    for (const [userIds, unsubscribe] of presenceSubscriptionsRef.current) {
      unsubscribe();
    }
    presenceSubscriptionsRef.current.clear();

    // Clear typing timeouts
    for (const timeoutId of typingTimeoutRef.current.values()) {
      clearTimeout(timeoutId);
    }
    typingTimeoutRef.current.clear();

    // Reset state
    setTypingUsers([]);
    setOnlineUsers(new Map());
    setIsConnected(false);

    connectionInitializedRef.current = false;
  }, []);

  /**
   * Handle page focus/blur for presence updates
   */
  useEffect(() => {
    if (!reconnectOnFocus || !isAuthenticated) {
      return;
    }

    const handleFocus = () => {
      logger.info('Page focused, updating presence to online');
      updatePresence('online');
    };

    const handleBlur = () => {
      logger.info('Page blurred, updating presence to away');
      updatePresence('away');
    };

    const handleBeforeUnload = () => {
      logger.info('Page unloading, updating presence to offline');
      updatePresence('offline');
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [reconnectOnFocus, isAuthenticated, updatePresence]);

  /**
   * Auto-initialize connection
   */
  useEffect(() => {
    if (autoConnect && isAuthenticated && user) {
      initializeConnection();
    }

    return () => {
      if (autoConnect) {
        cleanup();
      }
    };
  }, [autoConnect, isAuthenticated, user, initializeConnection, cleanup]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    typingUsers,
    onlineUsers,
    isConnected,
    setTyping,
    updatePresence,
    subscribeToConversation,
    subscribeToPresence
  };
}

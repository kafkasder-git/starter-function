/**
 * @fileoverview Realtime Messaging Service
 * @description Appwrite Realtime API integration for real-time messaging features
 */

import { client, DATABASE_ID } from '@/lib/appwrite';
import { collections, db } from '@/lib/database';
import { logger } from '@/lib/logging/logger';
import { messagingService } from './messagingService';
import type {
  Message,
  UserPresence,
  TypingIndicator,
  MessageReadStatus,
  ConversationType,
  UserPresenceStatus
} from '@/types/messaging';
import type { Models } from 'appwrite';

// Define RealtimeResponse type since it's not exported from Appwrite types
export interface RealtimeResponse<T> {
  events: string[];
  channels: string[];
  timestamp: number;
  payload: T;
}

export interface RealtimeCallbacks {
  onMessage: (message: Message) => void;
  onTyping: (indicator: TypingIndicator) => void;
  onReadStatus: (status: MessageReadStatus) => void;
  onPresenceChange: (presence: UserPresence) => void;
  onConnectionChange: (connected: boolean) => void;
}

export interface ConversationCallbacks {
  onMessage: (message: Message) => void;
  onTyping: (indicator: TypingIndicator) => void;
  onReadStatus: (status: MessageReadStatus) => void;
}

/**
 * Realtime Messaging Service Class
 */
export class RealtimeMessagingService {
  private static instance: RealtimeMessagingService;
  private subscriptions: Map<string, () => void> = new Map();
  private globalCallbacks: RealtimeCallbacks | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;

  public static getInstance(): RealtimeMessagingService {
    if (!RealtimeMessagingService.instance) {
      RealtimeMessagingService.instance = new RealtimeMessagingService();
    }
    return RealtimeMessagingService.instance;
  }

  private constructor() {
    this.setupConnectionMonitoring();
    logger.info('RealtimeMessagingService initialized');
  }

  /**
   * Setup connection monitoring and heartbeat
   */
  private setupConnectionMonitoring() {
    // Monitor connection status
    window.addEventListener('online', () => {
      logger.info('Network connection restored');
      this.handleConnectionChange(true);
    });

    window.addEventListener('offline', () => {
      logger.info('Network connection lost');
      this.handleConnectionChange(false);
    });

    // Start heartbeat to monitor connection
    this.startHeartbeat();
  }

  /**
   * Start heartbeat to monitor connection health
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Check connection health
   */
  private async checkConnectionHealth() {
    try {
      // Try to get a simple document to test connection
      const { databases } = await import('@/lib/appwrite');
      if (databases) {
        await databases.get(DATABASE_ID);
        this.handleConnectionChange(true);
      }
    } catch (error) {
      logger.warn('Connection health check failed', error);
      this.handleConnectionChange(false);
      this.attemptReconnect();
    }
  }

  /**
   * Handle connection state changes
   */
  private handleConnectionChange(connected: boolean) {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.globalCallbacks?.onConnectionChange?.(connected);
      
      if (connected) {
        this.reconnectAttempts = 0;
        logger.info('Realtime connection established');
      } else {
        logger.warn('Realtime connection lost');
      }
    }
  }

  /**
   * Attempt to reconnect
   */
  private async attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.checkConnectionHealth();
    }, this.reconnectInterval);
  }

  /**
   * Set global callbacks for realtime events
   */
  setGlobalCallbacks(callbacks: RealtimeCallbacks) {
    this.globalCallbacks = callbacks;
  }

  /**
   * Subscribe to conversation-specific events
   */
  subscribeToConversation(conversationId: string, callbacks: ConversationCallbacks): () => void {
    try {
      logger.info('Subscribing to conversation', { conversationId });

      const messageSubscription = client.subscribe(
        `databases.${DATABASE_ID}.collections.${collections.MESSAGES}.documents`,
        (response: RealtimeResponse<Message>) => {
          this.handleRealtimeEvent(response, 'message', conversationId, callbacks);
        }
      );

      const typingSubscription = client.subscribe(
        `databases.${DATABASE_ID}.collections.${collections.TYPING_INDICATORS}.documents`,
        (response: RealtimeResponse<TypingIndicator>) => {
          this.handleRealtimeEvent(response, 'typing', conversationId, callbacks);
        }
      );

      const readStatusSubscription = client.subscribe(
        `databases.${DATABASE_ID}.collections.${collections.MESSAGE_READ_STATUS}.documents`,
        (response: RealtimeResponse<MessageReadStatus>) => {
          this.handleRealtimeEvent(response, 'readStatus', conversationId, callbacks);
        }
      );

      // Store subscriptions for cleanup
      const unsubscribe = () => {
        messageSubscription();
        typingSubscription();
        readStatusSubscription();
        this.subscriptions.delete(conversationId);
        logger.info('Unsubscribed from conversation', { conversationId });
      };

      this.subscriptions.set(conversationId, unsubscribe);
      this.handleConnectionChange(true);

      return unsubscribe;

    } catch (error) {
      logger.error('Failed to subscribe to conversation', { conversationId, error });
      this.handleConnectionChange(false);
      return () => {}; // Return empty function
    }
  }

  /**
   * Subscribe to user presence updates
   */
  subscribeToPresence(userIds: string[], onPresenceChange: (presence: UserPresence) => void): () => void {
    try {
      logger.info('Subscribing to presence updates', { userIds });

      const presenceSubscription = client.subscribe(
        `databases.${DATABASE_ID}.collections.${collections.USER_PRESENCE}.documents`,
        async (response: RealtimeResponse<UserPresence>) => {
          try {
            const { events, payload } = response;
            
            // Check if this is an update for one of the users we're monitoring
            if (payload && userIds.includes(payload.user_id)) {
              const presence: UserPresence = {
                userId: payload.user_id,
                status: payload.status,
                lastSeen: new Date(payload.last_seen)
              };

              onPresenceChange(presence);
              this.globalCallbacks?.onPresenceChange?.(presence);
            }
          } catch (error) {
            logger.error('Error processing presence update', error);
          }
        }
      );

      return presenceSubscription;

    } catch (error) {
      logger.error('Failed to subscribe to presence updates', error);
      return () => {}; // Return empty function
    }
  }

  /**
   * Handle realtime events
   */
  private async handleRealtimeEvent(
    response: RealtimeResponse<any>,
    eventType: 'message' | 'typing' | 'readStatus',
    conversationId: string,
    callbacks: ConversationCallbacks
  ) {
    try {
      const { events, payload } = response;

      if (!payload) return;

      // Filter events by conversation if applicable
      if (payload.conversation_id && payload.conversation_id !== conversationId) {
        return;
      }

      switch (eventType) {
        case 'message':
          await this.handleMessageEvent(payload, callbacks);
          break;
        case 'typing':
          await this.handleTypingEvent(payload, callbacks);
          break;
        case 'readStatus':
          await this.handleReadStatusEvent(payload, callbacks);
          break;
      }

    } catch (error) {
      logger.error('Error handling realtime event', { eventType, conversationId, error });
    }
  }

  /**
   * Handle message events
   */
  private async handleMessageEvent(payload: any, callbacks: ConversationCallbacks) {
    try {
      // Build full message object
      const message = await messagingService.buildMessageFromDocument(payload);
      if (message) {
        callbacks.onMessage(message);
        this.globalCallbacks?.onMessage?.(message);
      }
    } catch (error) {
      logger.error('Error processing message event', error);
    }
  }

  /**
   * Handle typing indicator events
   */
  private async handleTypingEvent(payload: any, callbacks: ConversationCallbacks) {
    try {
      // Get user profile for typing indicator
      const { data: userProfile, error } = await db.get(
        collections.USER_PROFILES,
        payload.user_id
      );

      if (error) {
        logger.error('Failed to get user profile for typing indicator', error);
        return;
      }

      const indicator: TypingIndicator = {
        conversationId: payload.conversation_id,
        userId: payload.user_id,
        userName: userProfile?.name || 'Unknown User',
        isTyping: payload.is_typing,
        updatedAt: new Date(payload.updated_at)
      };

      callbacks.onTyping(indicator);
      this.globalCallbacks?.onTyping?.(indicator);
    } catch (error) {
      logger.error('Error processing typing event', error);
    }
  }

  /**
   * Handle read status events
   */
  private async handleReadStatusEvent(payload: any, callbacks: ConversationCallbacks) {
    try {
      // Get user profile for read status
      const { data: userProfile, error } = await db.get(
        collections.USER_PROFILES,
        payload.user_id
      );

      if (error) {
        logger.error('Failed to get user profile for read status', error);
        return;
      }

      const readStatus: MessageReadStatus = {
        userId: payload.user_id,
        userName: userProfile?.name || 'Unknown User',
        readAt: new Date(payload.read_at)
      };

      callbacks.onReadStatus(readStatus);
      this.globalCallbacks?.onReadStatus?.(readStatus);
    } catch (error) {
      logger.error('Error processing read status event', error);
    }
  }

  /**
   * Update typing indicator
   */
  async updateTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    try {
      await messagingService.updateTypingIndicator(conversationId, isTyping);
    } catch (error) {
      logger.error('Failed to update typing indicator', { conversationId, isTyping, error });
    }
  }

  /**
   * Update user presence
   */
  async updatePresence(status: UserPresenceStatus): Promise<void> {
    try {
      await messagingService.updatePresence(status);
    } catch (error) {
      logger.error('Failed to update presence', { status, error });
    }
  }

  /**
   * Get connection status
   */
  isConnectedToRealtime(): boolean {
    return this.isConnected;
  }

  /**
   * Cleanup all subscriptions
   */
  cleanup(): void {
    logger.info('Cleaning up realtime subscriptions');
    
    // Unsubscribe from all conversations
    for (const [conversationId, unsubscribe] of this.subscriptions) {
      unsubscribe();
    }
    this.subscriptions.clear();

    // Stop heartbeat
    this.stopHeartbeat();

    // Clear callbacks
    this.globalCallbacks = null;

    this.handleConnectionChange(false);
  }

  /**
   * Get active subscription count
   */
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Force reconnect
   */
  async forceReconnect(): Promise<void> {
    logger.info('Force reconnecting to realtime');
    this.cleanup();
    this.reconnectAttempts = 0;
    await this.checkConnectionHealth();
  }
}

// Export singleton instance
export const realtimeMessagingService = RealtimeMessagingService.getInstance();

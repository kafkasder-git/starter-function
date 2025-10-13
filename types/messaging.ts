/**
 * @fileoverview Messaging Types
 * @description TypeScript interfaces and enums for real-time messaging system
 */

import type { UserRole } from './auth';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group'
}

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  VOICE = 'voice',
  SYSTEM = 'system'
}

export enum UserPresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  OFFLINE = 'offline',
  BUSY = 'busy'
}

export interface Conversation {
  id: string;
  name?: string;
  type: ConversationType;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  lastMessageAt?: Date;
  unreadCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ConversationParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  userRole: UserRole;
  conversationRole: 'admin' | 'member';
  joinedAt: Date;
  lastReadAt?: Date;
  isOnline: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content?: string;
  type: MessageType;
  attachments: MessageAttachment[];
  replyTo?: Message;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  readBy: MessageReadStatus[];
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  duration?: number;
}

export interface MessageReadStatus {
  userId: string;
  userName: string;
  readAt: Date;
}

export interface UserPresence {
  userId: string;
  status: UserPresenceStatus;
  lastSeen: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  updatedAt: Date;
}

// Database document interfaces (Appwrite specific)
export interface ConversationDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name?: string;
  type: ConversationType;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  is_active: boolean;
}

export interface ConversationParticipantDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  role: 'admin' | 'member';
  is_active: boolean;
  last_read_at?: string;
}

export interface MessageDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  type: MessageType;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  reply_to_message_id?: string;
}

export interface MessageAttachmentDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  message_id: string;
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  thumbnail_url?: string;
  duration?: number;
}

export interface MessageReadStatusDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface UserPresenceDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  user_id: string;
  status: UserPresenceStatus;
  last_seen: string;
  updated_at: string;
}

export interface TypingIndicatorDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

// Service interfaces
export interface CreateConversationData {
  type: ConversationType;
  participantIds: string[];
  name?: string;
  createdBy: string;
  avatarUrl?: string;
}

export interface SendMessageData {
  conversationId: string;
  senderId: string;
  content?: string;
  type: MessageType;
  attachments?: File[];
  replyTo?: string;
  replyToMessageId?: string;
}

export interface UploadAttachmentData {
  messageId: string;
  file: File;
  fileType: 'image' | 'document' | 'voice';
}

export interface MessageFilters {
  conversationId: string;
  limit?: number;
  offset?: number;
  before?: Date;
  after?: Date;
  senderId?: string;
  type?: MessageType;
}

export interface ConversationFilters {
  userId: string;
  type?: ConversationType;
  isActive?: boolean;
}

// Hook return types
export interface UseMessagingReturn {
  conversations: Conversation[];
  selectedConversation: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  
  // Conversation operations
  createConversation: (data: CreateConversationData) => Promise<Conversation>;
  loadConversations: () => Promise<void>;
  getConversationById: (id: string) => Promise<Conversation | null>;
  addParticipants: (conversationId: string, userIds: string[]) => Promise<void>;
  removeParticipant: (conversationId: string, userId: string) => Promise<void>;
  
  // Message operations
  sendMessage: (data: SendMessageData) => Promise<Message>;
  loadMessages: (conversationId: string, limit?: number, offset?: number) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  getUnreadCount: (conversationId: string) => Promise<number>;
  
  // UI state
  setSelectedConversation: (id: string | null) => void;
  clearError: () => void;
}

export interface UseRealtimeMessagingReturn {
  typingUsers: TypingIndicator[];
  onlineUsers: Map<string, UserPresence>;
  isConnected: boolean;
  
  setTyping: (conversationId: string, isTyping: boolean) => void;
  updatePresence: (status: UserPresenceStatus) => void;
  subscribeToConversation: (conversationId: string, callbacks: {
    onMessage: (message: Message) => void;
    onTyping: (indicator: TypingIndicator) => void;
    onReadStatus: (status: MessageReadStatus) => void;
    onPresenceChange: (presence: UserPresence) => void;
  }) => () => void;
}

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  error: string | null;
  
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  clearRecording: () => void;
  formatDuration: (seconds: number) => string;
  getAudioFileSize: (blob: Blob) => string;
  isRecordingSupported: boolean;
  maxDuration: number;
}

// Error types
export interface MessagingError {
  code: string;
  message: string;
  details?: any;
}

export class MessagingServiceError extends Error {
  public code: string;
  public details?: any;

  constructor(code: string, message: string, details?: any) {
    super(message);
    this.name = 'MessagingServiceError';
    this.code = code;
    this.details = details;
  }
}

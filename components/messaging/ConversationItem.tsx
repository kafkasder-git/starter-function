/**
 * @fileoverview Conversation Item Component
 * @description Individual conversation item in the conversation list
 */

// import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/messaging';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected?: boolean;
  currentUserId: string;
  onClick: () => void;
  onMenuClick?: (conversation: Conversation) => void;
}

/**
 * ConversationItem component
 */
export function ConversationItem({
  conversation,
  isSelected = false,
  currentUserId,
  onClick,
  onMenuClick
}: ConversationItemProps) {
  // Get other participants (exclude current user)
  const otherParticipants = conversation.participants.filter(p => p.userId !== currentUserId);
  const primaryParticipant = otherParticipants[0];

  // Get conversation display name
  const getDisplayName = () => {
    if (conversation.type === 'group' && conversation.name) {
      return conversation.name;
    }
    
    if (primaryParticipant) {
      return primaryParticipant.userName;
    }
    
    return 'Konuşma';
  };

  // Get conversation display avatar
  const getDisplayAvatar = () => {
    if (conversation.type === 'group') {
      // For groups, show first letter of group name or first participant
      const groupName = conversation.name || primaryParticipant?.userName || 'G';
      return groupName.charAt(0).toUpperCase();
    }
    
    if (primaryParticipant) {
      return primaryParticipant.userName.charAt(0).toUpperCase();
    }
    
    return '?';
  };

  // Get last message preview
  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) {
      return 'Henüz mesaj yok';
    }

    const message = conversation.lastMessage;
    
    switch (message.type) {
      case 'text':
        return message.content || 'Mesaj';
      case 'file':
        return '📎 Dosya';
      case 'voice':
        return '🎤 Sesli mesaj';
      case 'system':
        return message.content || 'Sistem mesajı';
      default:
        return 'Mesaj';
    }
  };

  // Format last message time
  const formatLastMessageTime = () => {
    if (!conversation.lastMessageAt) {
      return '';
    }

    const now = new Date();
    const messageTime = new Date(conversation.lastMessageAt);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return messageTime.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return messageTime.toLocaleDateString('tr-TR', { 
        weekday: 'short' 
      });
    } else {
      return messageTime.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  // Check if last message is read
  const isLastMessageRead = () => {
    if (!conversation.lastMessage || conversation.lastMessage.senderId === currentUserId) {
      return true; // Own messages are considered read
    }

    return conversation.lastMessage.readBy.some(read => read.userId === currentUserId);
  };

  // Check if participant is online
  const isParticipantOnline = () => {
    return otherParticipants.some(p => p.isOnline);
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50',
        isSelected && 'bg-blue-50 border-l-4 border-blue-500'
      )}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {getDisplayAvatar()}
          </AvatarFallback>
        </Avatar>
        
        {/* Online indicator for direct messages */}
        {conversation.type === 'direct' && isParticipantOnline() && (
          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 truncate">
            {getDisplayName()}
          </h3>
          <div className="flex items-center gap-2">
            {/* Last message time */}
            {conversation.lastMessageAt && (
              <span className="text-xs text-gray-500">
                {formatLastMessageTime()}
              </span>
            )}
            
            {/* Menu button */}
            {onMenuClick && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuClick(conversation);
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Last message preview */}
          <p className="text-sm text-gray-600 truncate flex-1">
            {getLastMessagePreview()}
          </p>

          {/* Unread count and read status */}
          <div className="flex items-center gap-1 ml-2">
            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </Badge>
            )}
            
            {/* Read status indicator */}
            {conversation.lastMessage && 
             conversation.lastMessage.senderId === currentUserId && 
             isLastMessageRead() && (
              <CheckCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

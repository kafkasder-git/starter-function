/**
 * @fileoverview Conversation List Component
 * @description List of conversations with search and new conversation functionality
 */

// import React, { useState, useMemo } from 'react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { ConversationItem } from './ConversationItem';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/messaging';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  loading?: boolean;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
  onConversationMenuClick?: (conversation: Conversation) => void;
  className?: string;
}

/**
 * ConversationList component
 */
export function ConversationList({
  conversations,
  selectedConversationId,
  loading = false,
  onConversationSelect,
  onNewConversation,
  onConversationMenuClick,
  className
}: ConversationListProps) {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search term
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations;
    }

    const term = searchTerm.toLowerCase();
    
    return conversations.filter(conversation => {
      // Search in conversation name
      if (conversation.name?.toLowerCase().includes(term)) {
        return true;
      }

      // Search in participant names
      const participantNames = conversation.participants
        .filter(p => p.userId !== user?.id)
        .map(p => p.userName.toLowerCase());
      
      if (participantNames.some(name => name.includes(term))) {
        return true;
      }

      // Search in last message content
      if (conversation.lastMessage?.content?.toLowerCase().includes(term)) {
        return true;
      }

      return false;
    });
  }, [conversations, searchTerm, user?.id]);

  // Get total unread count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }, [conversations]);

  // Group conversations by type
  const groupedConversations = useMemo(() => {
    const direct = filteredConversations.filter(c => c.type === 'direct');
    const groups = filteredConversations.filter(c => c.type === 'group');
    
    return { direct, groups };
  }, [filteredConversations]);

  if (!user) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Giriş yapmanız gerekiyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Mesajlar</h1>
          <div className="flex items-center gap-2">
            {totalUnreadCount > 0 && (
              <Badge variant="destructive">
                {totalUnreadCount}
              </Badge>
            )}
            <Button
              onClick={onNewConversation}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Kişi veya konuşma ara..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2" />
              <p>Konuşmalar yükleniyor...</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz konuşma yok'}
              </p>
              {!searchTerm && (
                <p className="text-sm mt-1">
                  Yeni bir konuşma başlatın
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {/* Direct Messages */}
            {groupedConversations.direct.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2 px-3">
                  Doğrudan Mesajlar
                </h3>
                <div className="space-y-1">
                  {groupedConversations.direct.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversationId}
                      currentUserId={user.id}
                      onClick={() => { onConversationSelect(conversation.id); }}
                      onMenuClick={onConversationMenuClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Groups */}
            {groupedConversations.groups.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2 px-3">
                  Gruplar
                </h3>
                <div className="space-y-1">
                  {groupedConversations.groups.map((conversation) => (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isSelected={conversation.id === selectedConversationId}
                      currentUserId={user.id}
                      onClick={() => { onConversationSelect(conversation.id); }}
                      onMenuClick={onConversationMenuClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Footer with connection status */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {filteredConversations.length} konuşma
          </span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Çevrimiçi</span>
          </div>
        </div>
      </div>
    </div>
  );
}

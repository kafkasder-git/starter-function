/**
 * @fileoverview Message List Component
 * @description List of messages with infinite scroll and loading states
 */

// import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
// import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/messaging';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  loading?: boolean;
  hasMoreMessages?: boolean;
  typingUsers?: string[];
  onLoadMore?: () => void;
  onReply?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onDownloadAttachment?: (attachment: any) => void;
  className?: string;
}

/**
 * MessageList component
 */
export function MessageList({
  messages,
  currentUserId: _currentUserId,
  loading = false,
  hasMoreMessages = false,
  typingUsers = [],
  onLoadMore,
  onReply: _onReply,
  onDelete: _onDelete,
  onDownloadAttachment: _onDownloadAttachment,
  className,
}: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isScrolledToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isScrolledToBottom]);

  // Check if user is scrolled to bottom
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const threshold = 100;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < threshold;
    setIsScrolledToBottom(isAtBottom);
  }, []);

  // Load more messages when scrolled to top
  const handleScrollToTop = useCallback(async () => {
    if (hasMoreMessages && !isLoadingMore && onLoadMore) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [hasMoreMessages, isLoadingMore, onLoadMore]);

  // Scroll to bottom button click
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setIsScrolledToBottom(true);
    }
  }, []);

  // Group consecutive messages from same sender
  const groupedMessages = useMemo(() => {
    const groups: {
      senderId: string;
      messages: Message[];
      showAvatar: boolean;
    }[] = [];

    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null;
      // const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

      // Determine if we should show avatar
      const showAvatar =
        !prevMessage ||
        prevMessage.senderId !== message.senderId ||
        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() >
          5 * 60 * 1000; // 5 minutes gap

      // Add to existing group or create new group
      if (groups.length > 0 && groups[groups.length - 1]?.senderId === message.senderId) {
        groups[groups.length - 1]?.messages.push(message);
      } else {
        groups.push({
          senderId: message.senderId,
          messages: [message],
          showAvatar,
        });
      }
    });

    return groups;
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="text-center text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4" onScrollCapture={handleScroll}>
        <div className="py-4">
          {/* Load more button */}
          {hasMoreMessages && (
            <div className="flex justify-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScrollToTop}
                disabled={isLoadingMore}
                className="flex items-center gap-2"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  'Daha fazla mesaj yükle'
                )}
              </Button>
            </div>
          )}

          {/* Messages */}
          {groupedMessages.map((group, groupIndex) => (
            <div key={`group-${groupIndex}`} className="mb-4">
              {group.messages.map((message, messageIndex) => {
                const isOwnMessage = message.senderId === currentUserId;
                const isLastInGroup = messageIndex === group.messages.length - 1;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="mb-4">
              <TypingIndicator users={typingUsers} />
            </div>
          )}

          {/* Scroll to bottom trigger */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Scroll to bottom button */}
      {!isScrolledToBottom && (
        <div className="absolute bottom-20 right-6">
          <Button onClick={scrollToBottom} size="sm" className="h-10 w-10 rounded-full shadow-lg">
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

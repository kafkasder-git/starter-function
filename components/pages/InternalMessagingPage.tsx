import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Video, MoreVertical, ArrowLeft, Users, MessageCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/useTouchDevice';
import { useAuthStore } from '@/stores/authStore';
import { useMessaging } from '@/hooks/useMessaging';
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ConversationItem } from '@/components/messaging/ConversationItem';
import { MessageList } from '@/components/messaging/MessageList';
import { MessageInput } from '@/components/messaging/MessageInput';
import { NewConversationDialog } from '@/components/messaging/NewConversationDialog';
import { cn } from '@/lib/utils';
import type { Conversation, Message, MessageType } from '@/types/messaging';

// Remove mock data - we'll use real data from hooks

/**
 * InternalMessagingPage function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function InternalMessagingPage() {
  const isMobile = useIsMobile();
  const { user } = useAuthStore();
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);

  // Messaging hooks
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    error,
    loadConversations,
    sendMessage,
    loadMessages,
    markAsRead,
    deleteMessage,
    setSelectedConversation,
    clearError
  } = useMessaging();

  // Realtime messaging hook
  const {
    typingUsers,
    onlineUsers,
    isConnected,
    setTyping,
    updatePresence,
    subscribeToConversation
  } = useRealtimeMessaging();

  // Get current conversation
  const currentConversation = conversations.find(conv => conv.id === selectedConversation);

  // Get typing users for current conversation
  const currentTypingUsers = typingUsers
    .filter(t => t.conversationId === selectedConversation)
    .map(t => t.userName);

  // Handle conversation selection
  const handleConversationSelect = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
  }, [setSelectedConversation]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string, type: MessageType, attachments?: File[]) => {
    if (!selectedConversation) return;

    try {
      await sendMessage({
        conversationId: selectedConversation,
        content,
        type,
        attachments
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [selectedConversation, sendMessage]);

  // Handle typing indicator
  const handleTyping = useCallback(async (isTyping: boolean) => {
    if (!selectedConversation) return;
    
    try {
      await setTyping(selectedConversation, isTyping);
    } catch (error) {
      console.error('Failed to update typing status:', error);
    }
  }, [selectedConversation, setTyping]);

  // Handle conversation creation
  const handleConversationCreated = useCallback((conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowNewConversationDialog(false);
  }, [setSelectedConversation]);

  // Subscribe to realtime events when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !user) return;

    const unsubscribe = subscribeToConversation(selectedConversation, {
      onMessage: (message: Message) => {
        // Message will be added automatically by the hook
        // Mark as read if it's not from current user
        if (message.senderId !== user.id) {
          markAsRead(message.id);
        }
      },
      onTyping: (indicator) => {
        // Typing indicator is handled by the hook
      },
      onReadStatus: (status) => {
        // Read status is handled by the hook
      }
    });

    return unsubscribe;
  }, [selectedConversation, user, subscribeToConversation, markAsRead]);

  // Update presence when component mounts
  useEffect(() => {
    if (user) {
      updatePresence('online');
    }
  }, [user, updatePresence]);

  // Handle file download
  const handleDownloadAttachment = useCallback((attachment: any) => {
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle message reply
  const handleReply = useCallback((message: Message) => {
    // TODO: Implement reply functionality
    console.log('Reply to message:', message);
  }, []);

  // Handle message delete
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteMessage(messageId);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  }, [deleteMessage]);

  if (isMobile) {
    return (
      <div className="flex h-screen flex-col bg-gray-50">
        {!selectedConversation ? (
          /* Conversation List View */
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation}
            loading={loading}
            onConversationSelect={handleConversationSelect}
            onNewConversation={() => setShowNewConversationDialog(true)}
            className="flex-1"
          />
        ) : (
          /* Chat View */
          <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="mr-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="mr-3 h-8 w-8">
                    <AvatarFallback>
                      {currentConversation?.type === 'group' 
                        ? (currentConversation.name || 'G').charAt(0).toUpperCase()
                        : currentConversation?.participants
                            .filter(p => p.userId !== user?.id)[0]?.userName.charAt(0).toUpperCase() || '?'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {currentConversation?.type === 'group' 
                        ? currentConversation.name
                        : currentConversation?.participants
                            .filter(p => p.userId !== user?.id)[0]?.userName || 'Konuşma'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentConversation?.type === 'group' 
                        ? `${currentConversation.participants.length} katılımcı`
                        : currentConversation?.participants
                            .filter(p => p.userId !== user?.id)[0]?.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={user?.id || ''}
              loading={loading}
              hasMoreMessages={true}
              typingUsers={currentTypingUsers}
              onLoadMore={() => loadMessages(selectedConversation)}
              onReply={handleReply}
              onDelete={handleDeleteMessage}
              onDownloadAttachment={handleDownloadAttachment}
              className="flex-1"
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              placeholder="Mesaj yazın..."
              disabled={loading}
            />
          </div>
        )}

        {/* New Conversation Dialog */}
        <NewConversationDialog
          open={showNewConversationDialog}
          onOpenChange={setShowNewConversationDialog}
          onConversationCreated={handleConversationCreated}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-white">
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation}
          loading={loading}
          onConversationSelect={handleConversationSelect}
          onNewConversation={() => setShowNewConversationDialog(true)}
          className="h-full"
        />
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="mr-3 h-10 w-10">
                    <AvatarFallback>
                      {currentConversation.type === 'group' 
                        ? (currentConversation.name || 'G').charAt(0).toUpperCase()
                        : currentConversation.participants
                            .filter(p => p.userId !== user?.id)[0]?.userName.charAt(0).toUpperCase() || '?'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {currentConversation.type === 'group' 
                        ? currentConversation.name
                        : currentConversation.participants
                            .filter(p => p.userId !== user?.id)[0]?.userName || 'Konuşma'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {currentConversation.type === 'group' 
                        ? `${currentConversation.participants.length} katılımcı`
                        : currentConversation.participants
                            .filter(p => p.userId !== user?.id)[0]?.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={user?.id || ''}
              loading={loading}
              hasMoreMessages={true}
              typingUsers={currentTypingUsers}
              onLoadMore={() => loadMessages(selectedConversation)}
              onReply={handleReply}
              onDelete={handleDeleteMessage}
              onDownloadAttachment={handleDownloadAttachment}
              className="flex-1"
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              placeholder="Mesaj yazın..."
              disabled={loading}
            />
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Mesaj seçin</p>
              <p className="text-sm">Bir konuşma seçerek mesajlaşmaya başlayın</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConversationDialog}
        onOpenChange={setShowNewConversationDialog}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  );
}

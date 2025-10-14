import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  MessageCircle,
  Phone,
  Video,
  MoreVertical,
  Users,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { useAppwriteMessaging } from '../../hooks/useAppwriteMessaging';
import { useAppwriteConnection } from '../../hooks/useAppwriteConnection';
import { ConversationList } from '../messaging/ConversationList';
import { MessageList } from '../messaging/MessageList';
import { MessageInput } from '../messaging/MessageInput';
import { cn } from '../../lib/utils';
import type { Message, Conversation } from '../../types/messaging';

const InternalMessagingPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  const { isConnected: appwriteConnected } = useAppwriteConnection();
  const {
    // conversations: _messagingConversations, // Will be used in future features
    sendMessage,
    // markAsRead: _markAsRead, // Will be used in future features
    // createConversation: _createConversation, // Will be used in future features
    // joinConversation: _joinConversation, // Will be used in future features
    // loadConversations: _loadConversations, // Will be used in future features
    // loadMessages: _loadMessages, // Will be used in future features
  } = useAppwriteMessaging();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => { window.removeEventListener('resize', checkMobile); };
  }, []);

  // Mock data - replace with real data from Appwrite
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        name: 'Genel Sohbet',
        type: 'group' as any,
        participants: [
          {
            userId: 'user1',
            userName: 'Ahmet Yılmaz',
            userRole: 'user' as any,
            conversationRole: 'member',
            joinedAt: new Date(),
            isOnline: true,
          },
          {
            userId: 'user2',
            userName: 'Ayşe Demir',
            userRole: 'user' as any,
            conversationRole: 'member',
            joinedAt: new Date(),
            isOnline: true,
          },
          {
            userId: 'user3',
            userName: 'Mehmet Kaya',
            userRole: 'user' as any,
            conversationRole: 'member',
            joinedAt: new Date(),
            isOnline: false,
          },
        ],
        lastMessage: {
          id: '1',
          conversationId: '1',
          senderId: 'user1',
          senderName: 'Ahmet Yılmaz',
          content: 'Merhaba, nasılsınız?',
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isDeleted: false,
          readBy: [],
        },
        lastMessageAt: new Date(),
        unreadCount: 3,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
      {
        id: '2',
        name: 'Proje Ekibi',
        type: 'group' as any,
        participants: [
          {
            userId: 'user1',
            userName: 'Ahmet Yılmaz',
            userRole: 'user' as any,
            conversationRole: 'member',
            joinedAt: new Date(),
            isOnline: true,
          },
          {
            userId: 'user4',
            userName: 'Ayşe Demir',
            userRole: 'user' as any,
            conversationRole: 'member',
            joinedAt: new Date(),
            isOnline: true,
          },
          {
            userId: 'user5',
            userName: 'Fatma Öz',
            userRole: 'user' as any,
            conversationRole: 'member',
            joinedAt: new Date(),
            isOnline: true,
          },
        ],
        lastMessage: {
          id: '2',
          conversationId: '2',
          senderId: 'user4',
          senderName: 'Ayşe Demir',
          content: "Toplantı saat 14:00'da",
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          isDeleted: false,
          readBy: [],
        },
        lastMessageAt: new Date(Date.now() - 3600000),
        unreadCount: 0,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    ];

    setConversations(mockConversations);
    setIsConnected(appwriteConnected);
  }, [appwriteConnected]);

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation) {
      const mockMessages: Message[] = [
        {
          id: '1',
          conversationId: selectedConversation,
          senderId: 'user1',
          senderName: 'Ahmet Yılmaz',
          content: 'Merhaba, nasılsınız?',
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          isDeleted: false,
          readBy: [],
        },
        {
          id: '2',
          conversationId: selectedConversation,
          senderId: 'user2',
          senderName: 'Ayşe Demir',
          content: 'İyiyim, teşekkürler. Siz nasılsınız?',
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 3500000),
          updatedAt: new Date(Date.now() - 3500000),
          isDeleted: false,
          readBy: [],
        },
        {
          id: '3',
          conversationId: selectedConversation,
          senderId: 'user1',
          senderName: 'Ahmet Yılmaz',
          content: 'Ben de iyiyim, bugün toplantı var mı?',
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 3000000),
          updatedAt: new Date(Date.now() - 3000000),
          isDeleted: false,
          readBy: [],
        },
        {
          id: '4',
          conversationId: selectedConversation,
          senderId: 'user2',
          senderName: 'Ayşe Demir',
          content: "Evet, saat 14:00'da toplantı salonunda",
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 2900000),
          updatedAt: new Date(Date.now() - 2900000),
          isDeleted: false,
          readBy: [],
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (content: string, _type: any, _attachments?: File[]) => {
    if (!content.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation, content);
      // On mobile, hide conversation list after sending
      if (isMobile) {
        setShowConversationList(false);
      }
    } catch (_error) {
      // console.error('Mesaj gönderilemedi:', error); // TODO: Implement proper error handling
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // On mobile, hide conversation list when selecting
    if (isMobile) {
      setShowConversationList(false);
    }
  };

  const handleNewConversation = () => {
    // TODO: Implement new conversation creation
    // console.log('New conversation requested'); // Will be implemented later
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 bg-white border-b">
          {!showConversationList ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowConversationList(true); }}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">Mesajlar</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
              {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Kurum İçi Mesajlaşma</h1>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Bağlı' : 'Bağlantı Yok'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Yeni Grup
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List */}
        <div
          className={cn(
            'flex flex-col bg-white border-r',
            isMobile
              ? 'absolute inset-0 z-10 w-full'
              : 'w-80',
            !showConversationList && isMobile && 'hidden'
          )}
        >
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation}
            onConversationSelect={handleConversationSelect}
            onNewConversation={handleNewConversation}
            loading={false}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {selectedConv?.name?.charAt(0) || 'G'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedConv?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedConv?.participants.length} katılımcı
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 bg-gray-50">
                <MessageList
                  messages={messages}
                  currentUserId="user1"
                  loading={false}
                  hasMoreMessages={false}
                  typingUsers={[]}
                />
              </div>

              {/* Message Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                placeholder="Mesaj yazın..."
                disabled={false}
              />
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mesajlaşmaya Başlayın</h3>
                <p className="text-gray-500 mb-6">
                  Sol taraftan bir konuşma seçerek mesajlaşmaya başlayın veya yeni bir konuşma oluşturun.
                </p>
                <Button onClick={handleNewConversation} className="bg-blue-600 hover:bg-blue-700">
                  <Users className="h-4 w-4 mr-2" />
                  Yeni Konuşma
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalMessagingPage;

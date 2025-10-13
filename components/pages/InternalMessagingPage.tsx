import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Users,
  Settings
} from 'lucide-react';
import { useAppwriteMessaging } from '../../hooks/useAppwriteMessaging';
import { useAppwriteConnection } from '../../hooks/useAppwriteConnection';
import type { Message, Conversation } from '../../types/messaging';

const InternalMessagingPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const { isConnected: appwriteConnected } = useAppwriteConnection();
  const { 
    conversations: _messagingConversations,
    sendMessage,
    markAsRead: _markAsRead,
    createConversation: _createConversation,
    joinConversation: _joinConversation,
    loadConversations: _loadConversations,
    loadMessages: _loadMessages
  } = useAppwriteMessaging();

  // Mock data - replace with real data from Appwrite
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        name: 'Genel Sohbet',
        type: 'group' as any,
        participants: [
          { userId: 'user1', userName: 'Ahmet Yılmaz', userRole: 'user' as any, conversationRole: 'member', joinedAt: new Date(), isOnline: true },
          { userId: 'user2', userName: 'Ayşe Demir', userRole: 'user' as any, conversationRole: 'member', joinedAt: new Date(), isOnline: true },
          { userId: 'user3', userName: 'Mehmet Kaya', userRole: 'user' as any, conversationRole: 'member', joinedAt: new Date(), isOnline: false }
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
          readBy: []
        },
        lastMessageAt: new Date(),
        unreadCount: 3,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        id: '2',
        name: 'Proje Ekibi',
        type: 'group' as any,
        participants: [
          { userId: 'user1', userName: 'Ahmet Yılmaz', userRole: 'user' as any, conversationRole: 'member', joinedAt: new Date(), isOnline: true },
          { userId: 'user4', userName: 'Ayşe Demir', userRole: 'user' as any, conversationRole: 'member', joinedAt: new Date(), isOnline: true },
          { userId: 'user5', userName: 'Fatma Öz', userRole: 'user' as any, conversationRole: 'member', joinedAt: new Date(), isOnline: true }
        ],
        lastMessage: {
          id: '2',
          conversationId: '2',
          senderId: 'user4',
          senderName: 'Ayşe Demir',
          content: 'Toplantı saat 14:00\'da',
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000),
          isDeleted: false,
          readBy: []
        },
        lastMessageAt: new Date(Date.now() - 3600000),
        unreadCount: 0,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
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
          readBy: []
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
          readBy: []
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
          readBy: []
        },
        {
          id: '4',
          conversationId: selectedConversation,
          senderId: 'user2',
          senderName: 'Ayşe Demir',
          content: 'Evet, saat 14:00\'da toplantı salonunda',
          type: 'text' as any,
          attachments: [],
          createdAt: new Date(Date.now() - 2900000),
          updatedAt: new Date(Date.now() - 2900000),
          isDeleted: false,
          readBy: []
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">Kurum İçi Mesajlaşma</h1>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Bağlı" : "Bağlantı Yok"}
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

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r bg-gray-50 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Konuşma ara..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id
                      ? 'bg-blue-100 border-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => { setSelectedConversation(conversation.id); }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {conversation.name?.charAt(0) || 'G'}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.participants.some(p => p.isOnline) && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.name}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {selectedConv?.name?.charAt(0) || 'G'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium text-gray-900">{selectedConv?.name}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedConv?.participants.length} katılımcı
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === 'user1' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === 'user1'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.createdAt.toLocaleTimeString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Mesaj yazın..."
                      value={newMessage}
                      onChange={(e) => { setNewMessage(e.target.value); }}
                      onKeyPress={handleKeyPress}
                      className="pr-10"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bir konuşma seçin
                </h3>
                <p className="text-gray-500">
                  Sol taraftan bir konuşma seçerek mesajlaşmaya başlayın
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalMessagingPage;
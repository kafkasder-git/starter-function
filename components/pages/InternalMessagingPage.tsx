/**
 * @fileoverview InternalMessagingPage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, Search, MessageCircle, UserPlus, Circle } from 'lucide-react';

// Simple className utility function
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Simple toast function
const toast = {
  success: (message: string) => {},
};

interface User {
  id: string;
  name: string;
  department: string;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

const users: User[] = [
  { id: '1', name: 'Ahmet Yılmaz', department: 'Yönetim', isOnline: true },
  { id: '2', name: 'Fatma Özkan', department: 'Ba��ış', isOnline: true },
];

const conversations: Conversation[] = [
  {
    id: '1',
    participants: users,
    lastMessage: {
      id: '1',
      senderId: '2',
      content: 'Merhaba, nasılsınız?',
      timestamp: '10:30',
    },
    unreadCount: 1,
  },
];

const messages: Message[] = [
  {
    id: '1',
    senderId: '2',
    content: 'Merhaba, nasılsınız?',
    timestamp: '10:30',
  },
];

/**
 * InternalMessagingPage function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function InternalMessagingPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    toast.success('Mesaj gönderildi');
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-gray-50/50">
      <div className="container mx-auto p-4 sm:p-6 h-full max-w-6xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium">Kurum İçi Mesajlaşma</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Ekip üyeleriyle anlık iletişim kurun
            </p>
          </div>

          <Button className="gap-2" size="sm">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Yeni Sohbet</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 h-[calc(100vh-180px)]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Sohbetler</CardTitle>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Sohbet ara..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                    }}
                    className="pl-10 text-sm sm:text-base"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <div className="space-y-1 p-3">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                      }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50',
                        selectedConversation?.id === conversation.id && 'bg-muted',
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarFallback>
                            {conversation.participants.find((p) => p.id !== '1')?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.participants.find((p) => p.id !== '1')?.isOnline && (
                          <Circle className="absolute -bottom-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm sm:text-base font-medium truncate">
                            {conversation.participants.find((p) => p.id !== '1')?.name}
                          </h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {conversation.lastMessage.timestamp}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.content ?? 'Henüz mesaj yok'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs flex items-center justify-center">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-8">
            {selectedConversation ? (
              <Card className="h-full flex flex-col">
                {/* Chat Header */}
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback>
                          {selectedConversation.participants.find((p) => p.id !== '1')?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm sm:text-base font-medium">
                          {selectedConversation.participants.find((p) => p.id !== '1')?.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {selectedConversation.participants.find((p) => p.id !== '1')?.isOnline
                            ? 'Çevrimiçi'
                            : 'Çevrimdışı'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-3 max-w-[80%]',
                          message.senderId === '1' ? 'ml-auto flex-row-reverse' : '',
                        )}
                      >
                        {message.senderId !== '1' && (
                          <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1">
                            <AvatarFallback className="text-xs">
                              {
                                selectedConversation.participants.find(
                                  (p) => p.id === message.senderId,
                                )?.name[0]
                              }
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl px-3 py-2 sm:px-4 sm:py-2',
                            message.senderId === '1'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted',
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              'text-xs mt-1 opacity-70',
                              message.senderId === '1' ? 'text-right' : 'text-left',
                            )}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="p-3 sm:p-4 border-t">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Mesaj yazın..."
                      className="flex-1 text-sm sm:text-base"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="sm"
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      <span className="hidden sm:inline">Gönder</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-6">
                  <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">Sohbet Seçin</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Bir sohbet seçin veya yeni sohbet başlatın
                  </p>
                  <Button className="gap-2" size="sm">
                    <UserPlus className="h-4 w-4" />
                    Yeni Sohbet
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

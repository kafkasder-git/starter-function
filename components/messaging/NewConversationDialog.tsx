/**
 * @fileoverview New Conversation Dialog Component
 * @description Dialog for creating new conversations or groups
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, Users, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { db, collections, queryHelpers } from '@/lib/database';
import { ConversationType } from '@/types/messaging';
import type { UserRole } from '@/types/auth';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: string) => void;
  className?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

/**
 * NewConversationDialog component
 */
export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
  className
}: NewConversationDialogProps) {
  const { user: currentUser } = useAuthStore();
  
  // State
  const [conversationType, setConversationType] = useState<ConversationType>(ConversationType.DIRECT);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      // Reset state when dialog closes
      setConversationType(ConversationType.DIRECT);
      setSelectedUsers([]);
      setGroupName('');
      setSearchTerm('');
    }
  }, [open]);

  // Load users from database
  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const { data: userProfiles, error } = await db.list(
        collections.USER_PROFILES,
        [
          queryHelpers.equal('is_active', true),
          queryHelpers.orderAsc('name')
        ]
      );

      if (error) {
        console.error('Failed to load users:', error);
        return;
      }

      const userList: User[] = (userProfiles?.documents || [])
        .filter((profile: any) => profile.$id !== currentUser?.id) // Exclude current user
        .map((profile: any) => ({
          id: profile.$id,
          name: profile.name || profile.email?.split('@')[0] || 'Unknown User',
          email: profile.email || '',
          role: profile.role || 'viewer',
          avatar: profile.avatar_url
        }));

      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } 
        // For direct messages, only allow one user
        if (conversationType === ConversationType.DIRECT) {
          return [userId];
        }
        return [...prev, userId];
      
    });
  };

  // Handle conversation type change
  const handleConversationTypeChange = (type: ConversationType) => {
    setConversationType(type);
    
    // Clear selections when switching types
    setSelectedUsers([]);
    setGroupName('');
  };

  // Handle create conversation
  const handleCreateConversation = async () => {
    if (!currentUser) return;

    // Validate input
    if (conversationType === ConversationType.DIRECT && selectedUsers.length !== 1) {
      alert('Doğrudan mesajlaşma için bir kişi seçmelisiniz.');
      return;
    }

    if (conversationType === ConversationType.GROUP) {
      if (selectedUsers.length < 1) {
        alert('Grup için en az bir kişi seçmelisiniz.');
        return;
      }
      if (!groupName.trim()) {
        alert('Grup adı gereklidir.');
        return;
      }
    }

    try {
      setCreating(true);

      // Import messaging service dynamically to avoid circular imports
      const { messagingService } = await import('@/services/messagingService');

      const conversation = await messagingService.createConversation({
        type: conversationType,
        participantIds: selectedUsers,
        name: conversationType === ConversationType.GROUP ? groupName : undefined
      });

      onConversationCreated(conversation.id);
      onOpenChange(false);

    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Konuşma oluşturulamadı. Lütfen tekrar deneyin.');
    } finally {
      setCreating(false);
    }
  };

  // Get user display name
  const getUserDisplayName = (user: User) => {
    return user.name || user.email.split('@')[0] || 'Unknown User';
  };

  // Get user initials
  const getUserInitials = (user: User) => {
    const name = getUserDisplayName(user);
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl h-[600px] flex flex-col', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Yeni Konuşma
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6">
          {/* Conversation type selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Konuşma Türü</Label>
            <div className="flex gap-4">
              <Button
                variant={conversationType === ConversationType.DIRECT ? 'default' : 'outline'}
                onClick={() => { handleConversationTypeChange(ConversationType.DIRECT); }}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Doğrudan Mesaj
              </Button>
              <Button
                variant={conversationType === ConversationType.GROUP ? 'default' : 'outline'}
                onClick={() => { handleConversationTypeChange(ConversationType.GROUP); }}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Grup
              </Button>
            </div>
          </div>

          {/* Group name input */}
          {conversationType === ConversationType.GROUP && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Grup Adı</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => { setGroupName(e.target.value); }}
                placeholder="Grup adını girin..."
                maxLength={50}
              />
            </div>
          )}

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>Seçilen Kişiler ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId);
                  if (!user) return null;

                  return (
                    <Badge key={userId} variant="secondary" className="flex items-center gap-2">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      {getUserDisplayName(user)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { toggleUserSelection(userId); }}
                        className="h-4 w-4 p-0 hover:bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* User search */}
          <div className="space-y-2">
            <Label>Kişileri Seç</Label>
            <Input
              placeholder="Kişi ara..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); }}
            />
          </div>

          {/* Users list */}
          <div className="space-y-2">
            <Label>Kullanıcılar</Label>
            <ScrollArea className="h-48 border rounded-md">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2" />
                    <p className="text-sm">Yükleniyor...</p>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <div className="text-center text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">
                      {searchTerm ? 'Arama sonucu bulunamadı' : 'Kullanıcı bulunamadı'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors',
                        selectedUsers.includes(user.id) && 'bg-blue-50 border border-blue-200'
                      )}
                      onClick={() => { toggleUserSelection(user.id); }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        {selectedUsers.includes(user.id) && (
                          <Check className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => { onOpenChange(false); }}
            disabled={creating}
          >
            İptal
          </Button>
          <Button
            onClick={handleCreateConversation}
            disabled={creating || selectedUsers.length === 0 || (conversationType === ConversationType.GROUP && !groupName.trim())}
          >
            {creating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Oluşturuluyor...
              </>
            ) : (
              'Konuşma Oluştur'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

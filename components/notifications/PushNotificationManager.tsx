/**
 * Push Notification Manager Component
 * Manages push notification settings and permissions
 */

import { Bell, BellOff, Check, Loader2, Radio, Send, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';

interface PushNotificationManagerProps {
  className?: string;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ className = '' }) => {
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showNotification,
    sendToUser,
    broadcast,
  } = usePushNotifications();

  // Using sonner toast for better performance
  const [testNotification, setTestNotification] = useState({
    title: 'Test Bildirimi',
    body: 'Bu bir test bildirimidir.',
    requireInteraction: false,
  });
  const [targetUserId, setTargetUserId] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState({
    title: 'Sistem Bildirimi',
    body: '',
    requireInteraction: true,
  });

  const handleSubscribe = useCallback(async () => {
    const success = await subscribe();
    if (success) {
      toast.success('Push bildirimleri başarıyla etkinleştirildi.');
    } else {
      toast.error('Push bildirimleri etkinleştirilemedi.');
    }
  }, [subscribe]);

  const handleUnsubscribe = useCallback(async () => {
    const success = await unsubscribe();
    if (success) {
      toast.success('Push bildirimleri başarıyla kapatıldı.');
    } else {
      toast.error('Bildirimler kapatılamadı.');
    }
  }, [unsubscribe]);

  const handleTestNotification = useCallback(async () => {
    try {
      await showNotification({
        title: testNotification.title,
        body: testNotification.body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        requireInteraction: testNotification.requireInteraction,
        tag: 'test',
        actions: [
          { action: 'view', title: 'Görüntüle', icon: '/favicon.svg' },
          { action: 'dismiss', title: 'Kapat', icon: '/favicon.svg' },
        ],
      });

      toast.success('Test bildirimi başarıyla gönderildi.');
    } catch (err) {
      toast.error('Test bildirimi gönderilirken hata oluştu.');
    }
  }, [showNotification, testNotification]);

  const handleSendToUser = useCallback(async () => {
    if (!targetUserId.trim()) {
      toast.error('Lütfen geçerli bir kullanıcı ID girin.');
      return;
    }

    const success = await sendToUser(targetUserId, {
      title: 'Kişisel Bildirim',
      body: `Size özel bir mesaj: ${testNotification.body}`,
      icon: '/favicon.svg',
      requireInteraction: true,
    });

    if (success) {
      toast.success(`${targetUserId} kullanıcısına bildirim gönderildi.`);
    } else {
      toast.error('Kullanıcıya bildirim gönderilirken hata oluştu.');
    }
  }, [sendToUser, targetUserId, testNotification.body]);

  const handleBroadcast = useCallback(async () => {
    if (!broadcastMessage.body.trim()) {
      toast.error('Lütfen broadcast mesajı girin.');
      return;
    }

    const success = await broadcast({
      title: broadcastMessage.title,
      body: broadcastMessage.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      requireInteraction: broadcastMessage.requireInteraction,
      tag: 'broadcast',
      actions: [
        { action: 'view', title: 'Görüntüle' },
        { action: 'dismiss', title: 'Kapat' },
      ],
    });

    if (success) {
      toast.success('Tüm kullanıcılara bildirim gönderildi.');
      setBroadcastMessage((prev) => ({ ...prev, body: '' }));
    } else {
      toast.error('Broadcast gönderilirken hata oluştu.');
    }
  }, [broadcast, broadcastMessage, setBroadcastMessage]);

  const permissionBadge = useMemo(() => {
    switch (permission) {
      case 'granted':
        return (
          <Badge variant="default" className="bg-green-500">
            <Check className="w-3 h-3 mr-1" />
            İzin Verildi
          </Badge>
        );
      case 'denied':
        return (
          <Badge variant="destructive">
            <X className="w-3 h-3 mr-1" />
            İzin Reddedildi
          </Badge>
        );
      default:
        return <Badge variant="secondary">İzin Bekleniyor</Badge>;
    }
  }, [permission]);

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Bildirimleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <BellOff className="w-4 h-4" />
            <AlertDescription>Bu tarayıcı push bildirimleri desteklemiyor.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Bildirim Yönetimi
        </CardTitle>
        <CardDescription>
          Kullanıcılara anlık bildirimler gönderin ve bildirim ayarlarını yönetin.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Durum:</span>
              {permissionBadge}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Abonelik:</span>
              <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                {isSubscribed ? 'Aktif' : 'Pasif'}
              </Badge>
            </div>
          </div>

          <div className="space-x-2">
            {!isSubscribed ? (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading || permission === 'denied'}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Bildirimleri Etkinleştir
              </Button>
            ) : (
              <Button
                onClick={handleUnsubscribe}
                variant="outline"
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
                Bildirimleri Kapat
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <X className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Notification Management Tabs */}
        {isSubscribed && (
          <Tabs defaultValue="test" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="user">Kullanıcıya Gönder</TabsTrigger>
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            </TabsList>

            {/* Test Notifications */}
            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="test-title">Başlık</Label>
                  <Input
                    id="test-title"
                    value={testNotification.title}
                    onChange={(e) => {
                      setTestNotification((prev) => ({ ...prev, title: e.target.value }));
                    }}
                    placeholder="Bildirim başlığı"
                  />
                </div>

                <div>
                  <Label htmlFor="test-body">Mesaj</Label>
                  <Textarea
                    id="test-body"
                    value={testNotification.body}
                    onChange={(e) => {
                      setTestNotification((prev) => ({ ...prev, body: e.target.value }));
                    }}
                    placeholder="Bildirim mesajı"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="require-interaction"
                    checked={testNotification.requireInteraction}
                    onCheckedChange={(checked: boolean) => {
                      setTestNotification((prev) => ({ ...prev, requireInteraction: checked }));
                    }}
                  />
                  <Label htmlFor="require-interaction">Etkileşim Gerektir</Label>
                </div>

                <Button onClick={handleTestNotification} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Test Bildirimi Gönder
                </Button>
              </div>
            </TabsContent>

            {/* Send to User */}
            <TabsContent value="user" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="target-user">Kullanıcı ID</Label>
                  <Input
                    id="target-user"
                    value={targetUserId}
                    onChange={(e) => {
                      setTargetUserId(e.target.value);
                    }}
                    placeholder="Hedef kullanıcı ID"
                  />
                </div>

                <Button onClick={handleSendToUser} className="w-full gap-2">
                  <Send className="w-4 h-4" />
                  Kullanıcıya Gönder
                </Button>
              </div>
            </TabsContent>

            {/* Broadcast */}
            <TabsContent value="broadcast" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="broadcast-title">Başlık</Label>
                  <Input
                    id="broadcast-title"
                    value={broadcastMessage.title}
                    onChange={(e) => {
                      setBroadcastMessage((prev) => ({ ...prev, title: e.target.value }));
                    }}
                    placeholder="Broadcast başlığı"
                  />
                </div>

                <div>
                  <Label htmlFor="broadcast-body">Mesaj</Label>
                  <Textarea
                    id="broadcast-body"
                    value={broadcastMessage.body}
                    onChange={(e) => {
                      setBroadcastMessage((prev) => ({ ...prev, body: e.target.value }));
                    }}
                    placeholder="Tüm kullanıcılara gönderilecek mesaj"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="broadcast-interaction"
                    checked={broadcastMessage.requireInteraction}
                    onCheckedChange={(checked: boolean) => {
                      setBroadcastMessage((prev) => ({ ...prev, requireInteraction: checked }));
                    }}
                  />
                  <Label htmlFor="broadcast-interaction">Etkileşim Gerektir</Label>
                </div>

                <Button onClick={handleBroadcast} className="w-full gap-2" variant="destructive">
                  <Radio className="w-4 h-4" />
                  Herkese Gönder
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(PushNotificationManager);

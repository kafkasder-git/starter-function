/**
 * @fileoverview BulkMessagePage Module - Toplu mesaj gönderme sayfası
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import {
  Mail,
  MessageSquare,
  Phone,
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  type: 'email' | 'sms' | 'notification';
}

const messageTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Genel Duyuru',
    content: 'Sayın üyelerimiz, önemli bir duyuru paylaşmak istiyoruz.',
    type: 'email',
  },
  {
    id: '2',
    name: 'Etkinlik Daveti',
    content: 'Sizi yaklaşan etkinliğimize davet etmek istiyoruz.',
    type: 'email',
  },
  {
    id: '3',
    name: 'Acil Bildirim',
    content: 'Acil durum bildirimi.',
    type: 'sms',
  },
];

export function BulkMessagePage() {
  const [messageType, setMessageType] = useState<'email' | 'sms' | 'notification'>('email');
  const [recipientGroup, setRecipientGroup] = useState<string>('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error('Mesaj içeriği boş olamaz');
      return;
    }

    setIsSending(true);
    
    try {
      // Simüle edilmiş gönderme işlemi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${recipientGroup} grubuna ${messageType} mesajı başarıyla gönderildi`);
      
      // Formu temizle
      setSubject('');
      setMessage('');
      setSelectedTemplate('');
    } catch (_error) {
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      setMessage(template.content);
      setMessageType(template.type);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <Phone className="h-4 w-4" />;
      case 'notification':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'notification':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Toplu Mesaj Gönder</h1>
          <p className="text-gray-600">Üyelere toplu mesaj, email ve SMS gönderin</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            1,250 Üye
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-xl font-bold">1,200</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">SMS</p>
                <p className="text-xl font-bold">950</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bildirim</p>
                <p className="text-xl font-bold">1,250</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Send className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Bu Ay</p>
                <p className="text-xl font-bold">45</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mesaj Oluştur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Type */}
              <div className="space-y-2">
                <Label>Mesaj Türü</Label>
                <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mesaj türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        SMS
                      </div>
                    </SelectItem>
                    <SelectItem value="notification">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Bildirim
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipient Group */}
              <div className="space-y-2">
                <Label>Alıcı Grubu</Label>
                <Select value={recipientGroup} onValueChange={setRecipientGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alıcı grubu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Üyeler</SelectItem>
                    <SelectItem value="active">Aktif Üyeler</SelectItem>
                    <SelectItem value="donors">Bağışçılar</SelectItem>
                    <SelectItem value="volunteers">Gönüllüler</SelectItem>
                    <SelectItem value="students">Burslu Öğrenciler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject (for email) */}
              {messageType === 'email' && (
                <div className="space-y-2">
                  <Label>Konu</Label>
                  <Input
                    placeholder="Email konusu"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              {/* Message Content */}
              <div className="space-y-2">
                <Label>Mesaj İçeriği</Label>
                <Textarea
                  placeholder="Mesajınızı yazın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                />
                <div className="text-sm text-gray-500">
                  {message.length} karakter
                </div>
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim()}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Templates and Info */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Mesaj Şablonları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {messageTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    handleTemplateSelect(template.id);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <Badge className={getMessageTypeColor(template.type)}>
                      {getMessageTypeIcon(template.type)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sending Info */}
          <Card>
            <CardHeader>
              <CardTitle>Gönderim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Email: 1,200 alıcı</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>SMS: 950 alıcı</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Bildirim: 1,250 alıcı</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Mesajlar anında gönderilir</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BulkMessagePage;

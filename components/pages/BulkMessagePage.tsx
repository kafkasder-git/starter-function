import { FileText, Mail, MessageSquare, Phone, Send, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export function BulkMessagePage() {
  const [messageType, setMessageType] = useState('sms');
  const [recipientType, setRecipientType] = useState('all');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Mesaj içeriği boş olamaz');
      return;
    }
    toast.success('Toplu mesaj gönderiliyor...');
  };

  const handlePreview = () => {
    toast.success('Mesaj önizlemesi açılıyor...');
  };

  return (
    <div className="p-3 sm:p-6 lg:p-8 space-y-6 bg-slate-50/50 min-h-full safe-area">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Toplu Mesaj Gönderimi
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Üyeler ve bağışçılara toplu mesaj gönderin
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handlePreview} variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Önizle
          </Button>
          <Button onClick={handleSendMessage} size="sm">
            <Send className="w-4 h-4 mr-2" />
            Gönder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mesaj Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mesaj Tipi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">E-posta</SelectItem>
                    <SelectItem value="both">SMS + E-posta</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alıcılar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kişiler</SelectItem>
                    <SelectItem value="members">Sadece Üyeler</SelectItem>
                    <SelectItem value="donors">Sadece Bağışçılar</SelectItem>
                    <SelectItem value="beneficiaries">İhtiyaç Sahipleri</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(messageType === 'email' || messageType === 'both') && (
                <Input
                  placeholder="E-posta Konusu"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                  }}
                />
              )}

              <Textarea
                placeholder="Mesaj içeriğinizi buraya yazın..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
                rows={6}
                className="resize-none"
              />

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Karakter sayısı: {message.length}</span>
                {messageType === 'sms' && (
                  <span>SMS sayısı: {Math.ceil(message.length / 160) || 1}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gönderim Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Mesaj Tipi:</span>
                <Badge variant="outline">
                  {messageType === 'sms' && <Phone className="w-3 h-3 mr-1" />}
                  {messageType === 'email' && <Mail className="w-3 h-3 mr-1" />}
                  {messageType === 'both' && <Users className="w-3 h-3 mr-1" />}
                  {messageType === 'sms'
                    ? 'SMS'
                    : messageType === 'email'
                      ? 'E-posta'
                      : 'SMS + E-posta'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Alıcı Grubu:</span>
                <Badge variant="secondary">
                  {recipientType === 'all'
                    ? 'Tümü'
                    : recipientType === 'members'
                      ? 'Üyeler'
                      : recipientType === 'donors'
                        ? 'Bağışçılar'
                        : 'İhtiyaç Sahipleri'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Tahmini Alıcı:</span>
                <span className="font-semibold">~ 1,247 kişi</span>
              </div>
              {messageType === 'sms' && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">SMS Maliyeti:</span>
                  <span className="font-semibold text-amber-600">~ ₺124</span>
                </div>
              )}
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
              <span className="text-white text-2xl">📧</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Toplu Mesajlaşma</h3>
            <p className="text-sm text-slate-600 mb-4">
              Gelişmiş mesajlaşma özellikleri yakında eklenecek.
            </p>
            <Badge variant="secondary">Geliştiriliyor</Badge>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

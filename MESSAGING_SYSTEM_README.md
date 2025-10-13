# Gerçek Zamanlı Mesajlaşma Sistemi

Bu dokümantasyon, uygulamaya entegre edilen gerçek zamanlı mesajlaşma sisteminin kurulum, kullanım ve özelliklerini açıklar.

## 🚀 Özellikler

### ✅ Temel Özellikler
- **1-1 Özel Mesajlaşma**: İki kullanıcı arasında doğrudan mesajlaşma
- **Grup Mesajlaşması**: Birden fazla kullanıcının katıldığı grup konuşmaları
- **Gerçek Zamanlı Mesajlaşma**: Appwrite Realtime API ile anlık mesaj gönderimi
- **Dosya Paylaşımı**: Resim, PDF, doküman ve ses dosyalarının paylaşılması
- **Sesli Mesajlar**: Mikrofon ile sesli mesaj kaydetme ve gönderme
- **Çevrimiçi Durumu**: Kullanıcıların çevrimiçi/çevrimdışı durumlarının gösterimi
- **Yazıyor Göstergesi**: Kullanıcıların mesaj yazarken gösterilmesi
- **Okundu Bilgisi**: Mesajların kim tarafından okunduğunun gösterimi
- **Mesaj Silme**: Gönderilen mesajların silinebilmesi

### 🎨 Kullanıcı Arayüzü
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- **Modern UI**: Tailwind CSS ile tasarlanmış modern arayüz
- **Konuşma Listesi**: Tüm konuşmaların listelendiği sidebar
- **Mesaj Balonları**: Farklı türde mesajlar için özelleştirilmiş balonlar
- **Dosya Önizleme**: Paylaşılan dosyaların önizlenmesi
- **Sesli Mesaj Arayüzü**: Kayıt ve oynatma kontrolleri

### 🔧 Teknik Özellikler
- **TypeScript**: Tam tip güvenliği
- **React Hooks**: Özelleştirilmiş hook'lar ile state yönetimi
- **Appwrite Backend**: Veritabanı, depolama ve gerçek zamanlı özellikler
- **Error Handling**: Kapsamlı hata yönetimi
- **Loading States**: Yükleme durumları ve skeleton ekranlar
- **Performance**: Optimize edilmiş performans ve lazy loading

## 📁 Dosya Yapısı

```
├── types/
│   └── messaging.ts                    # Mesajlaşma tip tanımları
├── services/
│   ├── messagingService.ts             # Ana mesajlaşma servisi
│   └── realtimeMessagingService.ts     # Gerçek zamanlı mesajlaşma servisi
├── hooks/
│   ├── useMessaging.ts                 # Mesajlaşma işlemleri hook'u
│   ├── useRealtimeMessaging.ts         # Gerçek zamanlı özellikler hook'u
│   └── useVoiceRecorder.ts             # Sesli mesaj kayıt hook'u
├── components/messaging/
│   ├── ConversationList.tsx            # Konuşma listesi
│   ├── ConversationItem.tsx            # Tek konuşma öğesi
│   ├── MessageList.tsx                 # Mesaj listesi
│   ├── MessageBubble.tsx               # Mesaj balonu
│   ├── MessageInput.tsx                # Mesaj giriş alanı
│   ├── TypingIndicator.tsx             # Yazıyor göstergesi
│   ├── VoiceRecorder.tsx               # Sesli mesaj kayıt arayüzü
│   ├── FilePreview.tsx                 # Dosya önizleme
│   ├── MessageReadReceipts.tsx         # Okundu bilgisi
│   └── NewConversationDialog.tsx       # Yeni konuşma oluşturma
├── lib/storage/
│   └── storageService.ts               # Dosya depolama servisi
└── setup-messaging-collections.sh      # Appwrite kurulum scripti
```

## 🛠️ Kurulum

### 1. Gereksinimler
- Node.js 18+
- Appwrite CLI
- Appwrite projesi kurulumu

### 2. Appwrite Kurulumu

#### Appwrite CLI ile giriş yapın:
```bash
appwrite auth login
```

#### Mesajlaşma koleksiyonlarını ve storage bucket'larını oluşturun:
```bash
./setup-messaging-collections.sh
```

Bu script şunları oluşturur:
- **Storage Buckets**: `message_attachments`, `voice_messages`
- **Database Collections**: `conversations`, `conversation_participants`, `messages`, `message_attachments`, `message_read_status`, `user_presence`, `typing_indicators`
- **Database Indexes**: Performans için optimize edilmiş indexler

### 3. Ortam Değişkenleri

`lib/database.ts` dosyasında yeni koleksiyonlar tanımlanmıştır:

```typescript
export const collections = {
  // ... mevcut koleksiyonlar
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  CONVERSATION_PARTICIPANTS: 'conversation_participants',
  MESSAGE_ATTACHMENTS: 'message_attachments',
  MESSAGE_READ_STATUS: 'message_read_status',
  USER_PRESENCE: 'user_presence',
  TYPING_INDICATORS: 'typing_indicators',
} as const;
```

## 📱 Kullanım

### Temel Kullanım

```tsx
import { InternalMessagingPage } from '@/components/pages/InternalMessagingPage';

function App() {
  return <InternalMessagingPage />;
}
```

### Hook Kullanımı

#### Mesajlaşma Hook'u
```tsx
import { useMessaging } from '@/hooks/useMessaging';

function MyComponent() {
  const {
    conversations,
    selectedConversation,
    messages,
    loading,
    sendMessage,
    loadConversations,
    createConversation
  } = useMessaging();

  // Konuşmaları yükle
  useEffect(() => {
    loadConversations();
  }, []);

  // Mesaj gönder
  const handleSendMessage = async () => {
    await sendMessage({
      conversationId: selectedConversation,
      content: 'Merhaba!',
      type: 'text'
    });
  };

  return (
    // UI bileşenleri
  );
}
```

#### Gerçek Zamanlı Hook'u
```tsx
import { useRealtimeMessaging } from '@/hooks/useRealtimeMessaging';

function MyComponent() {
  const {
    typingUsers,
    onlineUsers,
    isConnected,
    setTyping,
    updatePresence
  } = useRealtimeMessaging();

  // Yazıyor durumunu güncelle
  const handleTyping = async (isTyping: boolean) => {
    await setTyping(conversationId, isTyping);
  };

  return (
    // UI bileşenleri
  );
}
```

### Servis Kullanımı

```tsx
import { messagingService } from '@/services/messagingService';

// Yeni konuşma oluştur
const conversation = await messagingService.createConversation({
  type: 'group',
  participantIds: ['user1', 'user2'],
  name: 'Proje Ekibi'
});

// Mesaj gönder
const message = await messagingService.sendMessage({
  conversationId: 'conv123',
  content: 'Merhaba!',
  type: 'text'
});
```

## 🎯 API Referansı

### MessagingService

#### `createConversation(data: CreateConversationData): Promise<Conversation>`
Yeni bir konuşma oluşturur.

**Parametreler:**
- `type`: 'direct' | 'group' - Konuşma türü
- `participantIds`: string[] - Katılımcı kullanıcı ID'leri
- `name?`: string - Grup adı (sadece grup konuşmaları için)

#### `sendMessage(data: SendMessageData): Promise<Message>`
Mesaj gönderir.

**Parametreler:**
- `conversationId`: string - Konuşma ID'si
- `content?`: string - Mesaj içeriği
- `type`: 'text' | 'file' | 'voice' | 'system' - Mesaj türü
- `attachments?`: File[] - Ekli dosyalar

#### `getMessages(filters: MessageFilters): Promise<Message[]>`
Konuşmanın mesajlarını getirir.

### RealtimeMessagingService

#### `subscribeToConversation(conversationId: string, callbacks: ConversationCallbacks): () => void`
Konuşma için gerçek zamanlı abonelik başlatır.

**Callbacks:**
- `onMessage`: Yeni mesaj geldiğinde
- `onTyping`: Yazıyor durumu değiştiğinde
- `onReadStatus`: Okundu durumu değiştiğinde

## 🔒 Güvenlik

### İzinler
- Kullanıcılar sadece katıldıkları konuşmaları görebilir
- Mesaj silme sadece gönderen kişi veya grup admin'i tarafından yapılabilir
- Dosya yükleme boyut ve tip kısıtlamaları vardır

### Dosya Güvenliği
- Maksimum dosya boyutu: 10MB (resimler), 50MB (ses dosyaları)
- İzin verilen dosya türleri: jpg, png, pdf, doc, mp3, webm vb.
- Antivirus taraması (Appwrite Storage'da)

## 📊 Performans

### Optimizasyonlar
- **Lazy Loading**: Mesajlar sayfa sayfa yüklenir
- **Virtual Scrolling**: Büyük mesaj listeleri için
- **Image Optimization**: Otomatik resim sıkıştırma
- **Caching**: Konuşma ve mesaj cache'leme
- **Debouncing**: Yazıyor göstergesi için

### Limitler
- Mesaj sayfası: 50 mesaj
- Maksimum grup üyesi: 100 kişi
- Maksimum dosya boyutu: 50MB
- Mesaj geçmişi: 30 gün (ayarlanabilir)

## 🐛 Hata Yönetimi

### Hata Türleri
- **Network Errors**: Bağlantı hataları
- **Permission Errors**: İzin hataları
- **File Upload Errors**: Dosya yükleme hataları
- **Realtime Errors**: Gerçek zamanlı bağlantı hataları

### Hata Mesajları
Tüm hata mesajları Türkçe olarak kullanıcıya gösterilir:

```typescript
// Örnek hata mesajları
"Mikrofon erişimi reddedildi"
"Dosya çok büyük"
"Konuşma oluşturulamadı"
"Mesaj gönderilemedi"
```

## 🧪 Test Etme

### Manuel Test Senaryoları

1. **Konuşma Oluşturma**
   - Doğrudan mesaj oluşturma
   - Grup konuşması oluşturma
   - Katılımcı ekleme/çıkarma

2. **Mesaj Gönderimi**
   - Metin mesajı
   - Dosya ekli mesaj
   - Sesli mesaj

3. **Gerçek Zamanlı Özellikler**
   - Anlık mesaj alımı
   - Yazıyor göstergesi
   - Çevrimiçi durumu
   - Okundu bilgisi

4. **Mobil Uyumluluk**
   - Responsive tasarım
   - Touch gestures
   - Mobile navigation

## 🔄 Güncellemeler

### Gelecek Özellikler
- [ ] Mesaj yanıtlama (reply)
- [ ] Mesaj forward etme
- [ ] Grup avatar'ları
- [ ] Mesaj arama
- [ ] Bildirim ayarları
- [ ] Mesaj şifreleme
- [ ] Video mesajlar
- [ ] Ekran paylaşımı

### Versiyon Geçmişi
- **v1.0.0**: Temel mesajlaşma özellikleri
- **v1.1.0**: Dosya paylaşımı ve sesli mesajlar
- **v1.2.0**: Gerçek zamanlı özellikler
- **v1.3.0**: Okundu bilgisi ve yazıyor göstergesi

## 📞 Destek

### Sorun Giderme
1. **Appwrite bağlantı sorunları**: `lib/appwrite.ts` konfigürasyonunu kontrol edin
2. **Dosya yükleme sorunları**: Storage bucket izinlerini kontrol edin
3. **Gerçek zamanlı sorunlar**: WebSocket bağlantısını kontrol edin

### Log Kayıtları
Tüm işlemler `lib/logging/logger.ts` ile loglanır:
```typescript
logger.info('Message sent successfully', { messageId });
logger.error('Failed to send message', error);
```

## 📄 Lisans

Bu mesajlaşma sistemi, proje lisansı altında kullanılabilir.

---

**Not**: Bu sistem production ortamında kullanılmadan önce kapsamlı test edilmelidir.

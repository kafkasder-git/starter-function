#!/bin/bash

# Appwrite Mesajlaşma Sistemi Kurulum Scripti
# Bu script Appwrite'da mesajlaşma için gerekli koleksiyonları ve storage bucket'ları oluşturur

set -e

echo "🚀 Appwrite Mesajlaşma Sistemi Kurulumu"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    print_error "Appwrite CLI bulunamadı. Lütfen önce Appwrite CLI'yi yükleyin:"
    echo "npm install -g appwrite-cli"
    exit 1
fi

# Check if logged in to Appwrite
if ! appwrite account get &> /dev/null; then
    print_warning "Appwrite'a giriş yapmanız gerekiyor:"
    echo "appwrite auth login"
    exit 1
fi

print_status "Appwrite CLI hazır"

# Set project ID
PROJECT_ID="68e99f6c000183bafb39"
DATABASE_ID="68e99f6c000183bafb39"

print_info "Proje ID: $PROJECT_ID"

# Create storage buckets for messaging
print_info "Depolama kovaları oluşturuluyor..."

# Message attachments bucket
appwrite storage createBucket \
    --bucketId="message_attachments" \
    --name="Message Attachments" \
    --permissions="read(\"any\")" \
    --fileSecurity=true \
    --enabled=true \
    --maximumFileSize=10485760 \
    --allowedFileExtensions='["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt", "mp3", "wav", "webm"]' \
    --compression=gzip \
    --encryption=true \
    --antivirus=true

print_status "Message Attachments bucket oluşturuldu"

# Voice messages bucket
appwrite storage createBucket \
    --bucketId="voice_messages" \
    --name="Voice Messages" \
    --permissions="read(\"any\")" \
    --fileSecurity=true \
    --enabled=true \
    --maximumFileSize=52428800 \
    --allowedFileExtensions='["mp3", "wav", "webm", "ogg"]' \
    --compression=gzip \
    --encryption=true \
    --antivirus=true

print_status "Voice Messages bucket oluşturuldu"

# Create database collections
print_info "Veritabanı koleksiyonları oluşturuluyor..."

# Conversations collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --name="Conversations" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "Conversations koleksiyonu oluşturuldu"

# Messages collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --name="Messages" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "Messages koleksiyonu oluşturuldu"

# Conversation participants collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversation_participants" \
    --name="Conversation Participants" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "Conversation Participants koleksiyonu oluşturuldu"

# Message attachments collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="message_attachments" \
    --name="Message Attachments" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "Message Attachments koleksiyonu oluşturuldu"

# Message read status collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="message_read_status" \
    --name="Message Read Status" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "Message Read Status koleksiyonu oluşturuldu"

# User presence collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="user_presence" \
    --name="User Presence" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "User Presence koleksiyonu oluşturuldu"

# Typing indicators collection
appwrite databases createCollection \
    --databaseId="$DATABASE_ID" \
    --collectionId="typing_indicators" \
    --name="Typing Indicators" \
    --permissions='["read(\"any\")", "write(\"any\")"]' \
    --documentSecurity=true \
    --enabled=true

print_status "Typing Indicators koleksiyonu oluşturuldu"

print_info "Koleksiyon öznitelikleri ekleniyor..."

# Add attributes to conversations collection
appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="name" \
    --size=255 \
    --required=true

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="type" \
    --size=50 \
    --required=true

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="created_by" \
    --size=255 \
    --required=true

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="avatar_url" \
    --size=500 \
    --required=false

appwrite databases createBooleanAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="is_active" \
    --required=true \
    --default=true

# Add attributes to messages collection
appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="conversation_id" \
    --size=255 \
    --required=true

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="sender_id" \
    --size=255 \
    --required=true

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="content" \
    --size=10000 \
    --required=false

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="type" \
    --size=50 \
    --required=true

appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="reply_to" \
    --size=255 \
    --required=false

appwrite databases createBooleanAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="is_edited" \
    --required=true \
    --default=false

appwrite databases createBooleanAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="is_deleted" \
    --required=true \
    --default=false

print_status "Koleksiyon öznitelikleri eklendi"

# Create indexes for performance
print_info "Performans için indexler oluşturuluyor..."

# Conversations indexes
appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="conversations_type" \
    --type="key" \
    --attributes='["type"]'

appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversations" \
    --key="conversations_created_by" \
    --type="key" \
    --attributes='["created_by"]'

# Messages indexes
appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="messages_conversation_id" \
    --type="key" \
    --attributes='["conversation_id"]'

appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="messages_sender_id" \
    --type="key" \
    --attributes='["sender_id"]'

appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="messages" \
    --key="messages_created_at" \
    --type="key" \
    --attributes='["$createdAt"]'

# Conversation participants indexes
appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversation_participants" \
    --key="participants_conversation_id" \
    --type="key" \
    --attributes='["conversation_id"]'

appwrite databases createIndex \
    --databaseId="$DATABASE_ID" \
    --collectionId="conversation_participants" \
    --key="participants_user_id" \
    --type="key" \
    --attributes='["user_id"]'

print_status "Indexler oluşturuldu"

# Create realtime subscriptions
print_info "Gerçek zamanlı abonelikler oluşturuluyor..."

# Note: Realtime subscriptions are created automatically when using the client SDK
# This is handled in the messaging service implementation

print_status "Mesajlaşma sistemi kurulumu tamamlandı!"

echo ""
echo "📋 Oluşturulan Kaynaklar:"
echo "========================"
echo "✅ Storage Buckets:"
echo "   • message_attachments (10MB max, güvenli dosya paylaşımı)"
echo "   • voice_messages (50MB max, sesli mesajlar)"
echo ""
echo "✅ Database Collections:"
echo "   • conversations (konuşmalar)"
echo "   • messages (mesajlar)"
echo "   • conversation_participants (katılımcılar)"
echo "   • message_attachments (dosya ekleri)"
echo "   • message_read_status (okundu bilgisi)"
echo "   • user_presence (çevrimiçi durumu)"
echo "   • typing_indicators (yazıyor göstergesi)"
echo ""
echo "🎯 Sonraki Adımlar:"
echo "=================="
echo "1. MCP sunucusunu yeniden başlatın: npm run mcp:start:full"
echo "2. Mesajlaşma sayfasını test edin"
echo "3. Gerçek zamanlı özellikleri kontrol edin"
echo ""
echo "🚀 Mesajlaşma sistemi hazır!"

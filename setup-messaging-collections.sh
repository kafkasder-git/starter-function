#!/bin/bash

# Messaging System Setup Script for Appwrite
# This script creates the necessary collections and storage buckets for the messaging system

echo "🚀 Setting up Messaging System Collections and Storage Buckets..."

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo "❌ Appwrite CLI is not installed. Please install it first:"
    echo "   npm install -g appwrite-cli"
    exit 1
fi

# Check if user is logged in
if ! appwrite auth status | grep -q "Logged in"; then
    echo "❌ Not logged in to Appwrite. Please login first:"
    echo "   appwrite auth login"
    exit 1
fi

# Get project ID from appwrite.json
PROJECT_ID=$(cat appwrite.json | grep '"projectId"' | cut -d'"' -f4)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not find project ID in appwrite.json"
    exit 1
fi

echo "📋 Project ID: $PROJECT_ID"

# Create Storage Buckets
echo "📦 Creating storage buckets..."

# Message Attachments Bucket
echo "Creating message_attachments bucket..."
appwrite storage createBucket \
    --bucketId="message_attachments" \
    --name="Message Attachments" \
    --permissions="read,write" \
    --fileSecurity="false" \
    --enabled="true" \
    --maximumFileSize="10485760" \
    --allowedFileExtensions="jpg,jpeg,png,gif,pdf,doc,docx,txt,mp4,mp3,wav" \
    --compression="gzip" \
    --encryption="none" \
    --antivirus="false"

# Voice Messages Bucket
echo "Creating voice_messages bucket..."
appwrite storage createBucket \
    --bucketId="voice_messages" \
    --name="Voice Messages" \
    --permissions="read,write" \
    --fileSecurity="false" \
    --enabled="true" \
    --maximumFileSize="52428800" \
    --allowedFileExtensions="webm,mp3,wav,ogg" \
    --compression="gzip" \
    --encryption="none" \
    --antivirus="false"

# Create Database Collections
echo "🗄️ Creating database collections..."

# Conversations Collection
echo "Creating conversations collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="conversations" \
    --name="Conversations" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

# Add attributes for conversations
appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="name" \
    --size="100" \
    --required="false"

appwrite databases createEnumAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="type" \
    --elements="direct,group" \
    --default="direct" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="created_by" \
    --size="255" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="created_at" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="updated_at" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="last_message_at" \
    --required="false"

appwrite databases createBooleanAttribute \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="is_active" \
    --default="true" \
    --required="true"

# Conversation Participants Collection
echo "Creating conversation_participants collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --name="Conversation Participants" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="conversation_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="user_id" \
    --size="255" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="joined_at" \
    --required="true"

appwrite databases createEnumAttribute \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="role" \
    --elements="admin,member" \
    --default="member" \
    --required="true"

appwrite databases createBooleanAttribute \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="is_active" \
    --default="true" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="last_read_at" \
    --required="false"

# Messages Collection
echo "Creating messages collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="messages" \
    --name="Messages" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="conversation_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="sender_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="content" \
    --size="10000" \
    --required="false"

appwrite databases createEnumAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="type" \
    --elements="text,file,voice,system" \
    --default="text" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="created_at" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="updated_at" \
    --required="true"

appwrite databases createBooleanAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="is_deleted" \
    --default="false" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="messages" \
    --key="reply_to_message_id" \
    --size="255" \
    --required="false"

# Message Attachments Collection
echo "Creating message_attachments collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --name="Message Attachments" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="message_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="file_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="file_name" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="file_type" \
    --size="100" \
    --required="true"

appwrite databases createIntegerAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="file_size" \
    --min="0" \
    --max="1073741824" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="file_url" \
    --size="1000" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="thumbnail_url" \
    --size="1000" \
    --required="false"

appwrite databases createIntegerAttribute \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="duration" \
    --min="0" \
    --max="3600" \
    --required="false"

# Message Read Status Collection
echo "Creating message_read_status collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="message_read_status" \
    --name="Message Read Status" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_read_status" \
    --key="message_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="message_read_status" \
    --key="user_id" \
    --size="255" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="message_read_status" \
    --key="read_at" \
    --required="true"

# User Presence Collection
echo "Creating user_presence collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="user_presence" \
    --name="User Presence" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="user_presence" \
    --key="user_id" \
    --size="255" \
    --required="true"

appwrite databases createEnumAttribute \
    --databaseId="production" \
    --collectionId="user_presence" \
    --key="status" \
    --elements="online,away,offline" \
    --default="offline" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="user_presence" \
    --key="last_seen" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="user_presence" \
    --key="updated_at" \
    --required="true"

# Typing Indicators Collection
echo "Creating typing_indicators collection..."
appwrite databases createCollection \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --name="Typing Indicators" \
    --permissions="read,write,create,update,delete" \
    --enabled="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --key="conversation_id" \
    --size="255" \
    --required="true"

appwrite databases createStringAttribute \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --key="user_id" \
    --size="255" \
    --required="true"

appwrite databases createBooleanAttribute \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --key="is_typing" \
    --default="false" \
    --required="true"

appwrite databases createDateTimeAttribute \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --key="updated_at" \
    --required="true"

# Create Indexes for better performance
echo "📊 Creating database indexes..."

# Conversations indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="conversations_type" \
    --type="key" \
    --attributes="type"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="conversations_created_by" \
    --type="key" \
    --attributes="created_by"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="conversations" \
    --key="conversations_last_message_at" \
    --type="key" \
    --attributes="last_message_at"

# Conversation participants indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="participants_conversation_id" \
    --type="key" \
    --attributes="conversation_id"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="participants_user_id" \
    --type="key" \
    --attributes="user_id"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="conversation_participants" \
    --key="participants_conversation_user" \
    --type="unique" \
    --attributes="conversation_id,user_id"

# Messages indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="messages" \
    --key="messages_conversation_id" \
    --type="key" \
    --attributes="conversation_id"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="messages" \
    --key="messages_sender_id" \
    --type="key" \
    --attributes="sender_id"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="messages" \
    --key="messages_created_at" \
    --type="key" \
    --attributes="created_at"

# Message attachments indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="message_attachments" \
    --key="attachments_message_id" \
    --type="key" \
    --attributes="message_id"

# Message read status indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="message_read_status" \
    --key="read_status_message_id" \
    --type="key" \
    --attributes="message_id"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="message_read_status" \
    --key="read_status_user_id" \
    --type="key" \
    --attributes="user_id"

# User presence indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="user_presence" \
    --key="presence_user_id" \
    --type="unique" \
    --attributes="user_id"

# Typing indicators indexes
appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --key="typing_conversation_id" \
    --type="key" \
    --attributes="conversation_id"

appwrite databases createIndex \
    --databaseId="production" \
    --collectionId="typing_indicators" \
    --key="typing_user_id" \
    --type="key" \
    --attributes="user_id"

echo "✅ Messaging system setup completed successfully!"
echo ""
echo "📋 Summary:"
echo "   • 2 Storage Buckets created"
echo "   • 7 Database Collections created"
echo "   • 20+ Database Indexes created"
echo ""
echo "🚀 You can now use the messaging system in your application!"
echo ""
echo "💡 Next steps:"
echo "   1. Update your appwrite.json with the new collection IDs"
echo "   2. Test the messaging functionality"
echo "   3. Configure permissions as needed"

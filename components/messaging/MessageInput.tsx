/**
 * @fileoverview Message Input Component
 * @description Input area for sending messages with file upload and voice recording
 */

// import React, { useState, useRef, useCallback } from 'react';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileAudio, FileText, Image as ImageIcon, Paperclip, Mic, Send, X, Smile } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { cn } from '@/lib/utils';
import type { MessageType } from '@/types/messaging';
import { MessageType as MessageTypeEnum } from '@/types/messaging';

interface MessageInputProps {
  onSendMessage: (content: string, type: MessageType, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

/**
 * MessageInput component
 */
export function MessageInput({
  onSendMessage,
  onTyping,
  placeholder = 'Mesaj yazın...',
  disabled = false,
  maxLength = 1000,
  className
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Handle message input change
  const handleMessageChange = useCallback((value: string) => {
    setMessage(value);
    
    // Typing indicator logic
    if (value.trim().length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 2000);
  }, [isTyping, onTyping]);

  // Handle send message
  const handleSend = useCallback(() => {
    if (!message.trim() && attachments.length === 0) {
      return;
    }

    // Determine message type
    let messageType: MessageType = MessageTypeEnum.TEXT;
    if (attachments.length > 0) {
      const hasVoice = attachments.some(file => file.type.startsWith('audio/'));
      messageType = hasVoice ? MessageTypeEnum.VOICE : MessageTypeEnum.FILE;
    }

    onSendMessage(message.trim(), messageType, attachments.length > 0 ? attachments : undefined);
    
    // Clear input and attachments
    setMessage('');
    setAttachments([]);
    setIsTyping(false);
    onTyping?.(false);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, [message, attachments, onSendMessage, onTyping]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file sizes (max 10MB per file)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} dosyası çok büyük. Maksimum 10MB olmalıdır.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle voice recording
  const handleVoiceRecording = useCallback((audioBlob: Blob | null) => {
    if (audioBlob) {
      const audioFile = new File([audioBlob], 'voice-message.webm', {
        type: audioBlob.type
      });
      setAttachments(prev => [...prev, audioFile]);
    }
    setShowVoiceRecorder(false);
    setIsRecording(false);
  }, []);

  // Get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 text-info-600" aria-hidden="true" />;
    }
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="h-4 w-4 text-warning-600" aria-hidden="true" />;
    }
    if (file.type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-primary-600" aria-hidden="true" />;
    }
    return <Paperclip className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950', className)}>
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-3 space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-700 dark:bg-neutral-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
                {getFileIcon(file)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {file.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                aria-label={`${file.name} dosyasını kaldır`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Voice recorder */}
      {showVoiceRecorder && (
        <div className="mb-3">
          <VoiceRecorder
            onRecordingComplete={handleVoiceRecording}
            onCancel={() => {
              setShowVoiceRecorder(false);
              setIsRecording(false);
            }}
          />
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* File upload button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="h-10 w-10 p-0 text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
          aria-label="Dosya ekle"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message input */}
        <div className="flex-1">
          <Textarea
            ref={inputRef}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className="min-h-[40px] max-h-32 resize-none text-neutral-900 dark:text-neutral-100"
          />
          
          {/* Character count */}
          {message.length > maxLength * 0.8 && (
            <div className="mt-1 text-right text-xs text-neutral-500 dark:text-neutral-400">
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice recording button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVoiceRecorder(true)}
          disabled={disabled || showVoiceRecorder}
          className={cn(
            'h-10 w-10 p-0 text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100',
            isRecording && 'text-error-600'
          )}
          aria-label="Ses kaydı başlat"
        >
          <Mic className="h-4 w-4" />
        </Button>

        {/* Emoji button (placeholder for future implementation) */}
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="h-10 w-10 p-0 text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
          aria-label="Emoji paneli"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
          size="sm"
          className="h-10 px-4"
          aria-label="Mesaj gönder"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

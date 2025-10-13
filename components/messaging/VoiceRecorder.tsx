/**
 * @fileoverview Voice Recorder Component
 * @description Voice recording interface for sending voice messages
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Play, Pause, X, Send } from 'lucide-react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob | null) => void;
  onCancel: () => void;
  className?: string;
}

/**
 * VoiceRecorder component
 */
export function VoiceRecorder({ onRecordingComplete, onCancel, className }: VoiceRecorderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const {
    isRecording,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
    formatDuration,
    getAudioFileSize,
    isRecordingSupported,
  } = useVoiceRecorder({
    maxDuration: 300, // 5 minutes
    onRecordingComplete: (blob) => {
      if (blob) {
        // Auto-play the recorded audio for preview
        playAudioPreview(blob);
      }
    },
    onError: (error) => {
      console.error('Voice recording error:', error);
    },
  });

  // Play audio preview
  const playAudioPreview = async (blob: Blob) => {
    try {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
        setIsPlaying(false);
      }

      const audio = new Audio();
      audio.src = URL.createObjectURL(blob);

      audio.onplay = () => {
        setIsPlaying(true);
      };
      audio.onpause = () => {
        setIsPlaying(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setAudioElement(null);
      };

      setAudioElement(audio);
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (!audioBlob) return;

    try {
      if (audioElement && !audioElement.paused) {
        audioElement.pause();
        setIsPlaying(false);
      } else if (audioElement) {
        await audioElement.play();
        setIsPlaying(true);
      } else {
        await playAudioPreview(audioBlob);
      }
    } catch (error) {
      console.error('Audio control error:', error);
    }
  };

  // Handle send
  const handleSend = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (audioElement) {
      audioElement.pause();
      setAudioElement(null);
    }
    clearRecording();
    onCancel();
  };

  // Handle discard
  const handleDiscard = () => {
    if (isRecording) {
      cancelRecording();
    } else if (audioBlob) {
      clearRecording();
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
    }
  };

  if (!isRecordingSupported) {
    return (
      <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
        <p className="text-red-600 text-sm">
          Tarayıcınız ses kaydını desteklemiyor. Lütfen güncel bir tarayıcı kullanın.
        </p>
        <Button variant="outline" size="sm" onClick={onCancel} className="mt-2">
          Kapat
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
        <p className="text-red-600 text-sm mb-2">{error}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Kapat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-4 bg-gray-50 border border-gray-200 rounded-lg', className)}>
      {isRecording ? (
        /* Recording state */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-900">Kayıt yapılıyor...</span>
            <span className="text-sm text-gray-500 ml-auto">{formatDuration(duration)}</span>
          </div>

          {/* Recording progress */}
          <div className="space-y-2">
            <Progress value={(duration / 300) * 100} className="h-2" />
            <p className="text-xs text-gray-500 text-center">Maksimum 5 dakika</p>
          </div>

          {/* Recording controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              İptal
            </Button>

            <Button
              onClick={stopRecording}
              size="sm"
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
            >
              <Square className="h-4 w-4" />
              Durdur
            </Button>
          </div>
        </div>
      ) : audioBlob ? (
        /* Recording completed - preview state */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span className="text-sm font-medium text-gray-900">Kayıt tamamlandı</span>
            <span className="text-sm text-gray-500 ml-auto">{formatDuration(duration)}</span>
          </div>

          {/* Audio preview controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Duraklat' : 'Oynat'}
            </Button>

            <div className="text-xs text-gray-500">{getAudioFileSize(audioBlob)}</div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscard}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Sil
            </Button>

            <Button onClick={handleSend} size="sm" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Gönder
            </Button>
          </div>
        </div>
      ) : (
        /* Ready to record state */
        <div className="space-y-4">
          <div className="text-center">
            <Mic className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Sesli mesaj kaydetmek için başlat butonuna basın
            </p>
          </div>

          {/* Recording controls */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              İptal
            </Button>

            <Button onClick={startRecording} size="sm" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Başlat
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * @fileoverview Voice Recorder Hook
 * @description Hook for recording voice messages using MediaRecorder API
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { logger } from '@/lib/logging/logger';
import type { UseVoiceRecorderReturn } from '@/types/messaging';

interface VoiceRecorderOptions {
  maxDuration?: number; // Maximum recording duration in seconds
  audioBitsPerSecond?: number; // Audio quality
  mimeType?: string; // Audio format
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: string) => void;
}

/**
 * Hook for recording voice messages
 */
export function useVoiceRecorder(options: VoiceRecorderOptions = {}): UseVoiceRecorderReturn {
  const {
    maxDuration = 300, // 5 minutes default
    audioBitsPerSecond = 128000, // 128 kbps
    mimeType = 'audio/webm;codecs=opus',
    onRecordingComplete,
    onError,
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  /**
   * Check if MediaRecorder is supported
   */
  const isMediaRecorderSupported = useCallback(() => {
    return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mimeType);
  }, [mimeType]);

  /**
   * Get user media (microphone access)
   */
  const getUserMedia = useCallback(async (): Promise<MediaStream> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      logger.info('Microphone access granted');
      return stream;
    } catch (err) {
      const errorMessage = this.getUserMediaErrorMessage(err);
      logger.error('Failed to access microphone', { error: err });
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Get user-friendly error message for getUserMedia errors
   */
  const getUserMediaErrorMessage = (err: any): string => {
    switch (err.name) {
      case 'NotAllowedError':
        return 'Mikrofon erişimi reddedildi. Lütfen mikrofon iznini etkinleştirin.';
      case 'NotFoundError':
        return 'Mikrofon bulunamadı. Lütfen mikrofonunuzun bağlı olduğundan emin olun.';
      case 'NotReadableError':
        return 'Mikrofon kullanılamıyor. Başka bir uygulama tarafından kullanılıyor olabilir.';
      case 'OverconstrainedError':
        return 'Mikrofon ayarları desteklenmiyor.';
      case 'SecurityError':
        return 'Güvenlik nedeniyle mikrofon erişimi engellendi.';
      default:
        return 'Mikrofon erişimi sırasında bilinmeyen bir hata oluştu.';
    }
  };

  /**
   * Start recording
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      setDuration(0);
      chunksRef.current = [];

      // Check MediaRecorder support
      if (!isMediaRecorderSupported()) {
        throw new Error(
          'Tarayıcınız ses kaydını desteklemiyor. Lütfen güncel bir tarayıcı kullanın.'
        );
      }

      // Get microphone access
      const stream = await getUserMedia();
      audioStreamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        onRecordingComplete?.(blob);
        logger.info('Voice recording completed', {
          duration,
          size: blob.size,
          type: blob.type,
        });
      };

      // Handle recording error
      mediaRecorder.onerror = (event) => {
        const errorMessage = 'Ses kaydı sırasında hata oluştu.';
        setError(errorMessage);
        onError?.(errorMessage);
        logger.error('MediaRecorder error', event);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);

        // Stop recording if max duration reached
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 1000);

      logger.info('Voice recording started');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ses kaydı başlatılamadı.';
      setError(errorMessage);
      onError?.(errorMessage);
      logger.error('Failed to start recording', err);
    }
  }, [
    isMediaRecorderSupported,
    getUserMedia,
    mimeType,
    audioBitsPerSecond,
    maxDuration,
    onRecordingComplete,
    onError,
  ]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Clear duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Stop audio stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          audioStreamRef.current = null;
        }

        logger.info('Voice recording stopped');
      }
    } catch (err) {
      const errorMessage = 'Ses kaydı durdurulamadı.';
      setError(errorMessage);
      onError?.(errorMessage);
      logger.error('Failed to stop recording', err);
    }
  }, [isRecording]);

  /**
   * Cancel recording
   */
  const cancelRecording = useCallback(() => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Clear duration timer
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        // Stop audio stream
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          audioStreamRef.current = null;
        }

        // Clear recording data
        setAudioBlob(null);
        setDuration(0);
        chunksRef.current = [];

        logger.info('Voice recording cancelled');
      }
    } catch (err) {
      logger.error('Failed to cancel recording', err);
    }
  }, [isRecording]);

  /**
   * Clear recorded audio
   */
  const clearRecording = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
    chunksRef.current = [];
    setError(null);
    logger.info('Voice recording cleared');
  }, []);

  /**
   * Format duration as MM:SS
   */
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  /**
   * Get audio file size in human readable format
   */
  const getAudioFileSize = useCallback((blob: Blob): string => {
    const bytes = blob.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }, []);

  /**
   * Check if recording is supported
   */
  const isRecordingSupported = useCallback((): boolean => {
    return (
      typeof MediaRecorder !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia !== 'undefined' &&
      isMediaRecorderSupported()
    );
  }, [isMediaRecorderSupported]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isRecording, stopRecording]);

  return {
    isRecording,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
    // Additional utilities
    formatDuration,
    getAudioFileSize,
    isRecordingSupported: isRecordingSupported(),
    maxDuration,
  };
}

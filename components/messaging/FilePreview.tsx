/**
 * @fileoverview File Preview Component
 * @description Preview component for different file types in messages
 */

// import React, { useState } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageAttachment } from '@/types/messaging';

interface FilePreviewProps {
  attachment: MessageAttachment;
  className?: string;
}

/**
 * FilePreview component
 */
export function FilePreview({ attachment, className }: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType.startsWith('video/')) {
      return '🎥';
    } else if (fileType.startsWith('audio/')) {
      return '🎵';
    } else if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return '📊';
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return '📦';
    }
    return '📎';
  };

  // Handle audio playback
  const handleAudioPlay = async () => {
    try {
      if (audioElement && !audioElement.paused) {
        audioElement.pause();
        setIsPlaying(false);
        return;
      }

      const audio = new Audio(attachment.fileUrl);
      setAudioElement(audio);

      audio.onplay = () => {
        setIsPlaying(true);
      };
      audio.onpause = () => {
        setIsPlaying(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
      };

      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  // Handle download
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.fileUrl;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render image preview
  const renderImagePreview = () => (
    <div className="space-y-4">
      <div className="relative max-w-full max-h-96 overflow-hidden rounded-lg">
        <img
          src={attachment.fileUrl}
          alt={attachment.fileName}
          className="w-full h-auto object-contain"
          onClick={() => {
            setIsPreviewOpen(true);
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{attachment.fileName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPreviewOpen(true);
            }}
            className="flex items-center gap-2"
          >
            Büyüt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            İndir
          </Button>
        </div>
      </div>
    </div>
  );

  // Render audio preview
  const renderAudioPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <Button onClick={handleAudioPlay} size="sm" className="h-12 w-12 rounded-full">
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
          <p className="text-xs text-gray-500">
            {attachment.duration ? `${attachment.duration} saniye` : 'Ses dosyası'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsMuted(!isMuted);
          }}
          className="h-8 w-8 p-0"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  // Render generic file preview
  const renderGenericPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-4xl">{getFileIcon(attachment.fileType)}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{attachment.fileName}</p>
          <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
          <p className="text-xs text-gray-400 capitalize">{attachment.fileType}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          İndir
        </Button>
      </div>
    </div>
  );

  // Render preview based on file type
  const renderPreview = () => {
    if (attachment.fileType.startsWith('image/')) {
      return renderImagePreview();
    } else if (attachment.fileType.startsWith('audio/')) {
      return renderAudioPreview();
    }
    return renderGenericPreview();
  };

  return (
    <>
      <div className={cn('w-full', className)}>{renderPreview()}</div>

      {/* Image preview modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate">{attachment.fileName}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 pt-0">
            <div className="relative max-w-full max-h-[70vh] overflow-hidden">
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

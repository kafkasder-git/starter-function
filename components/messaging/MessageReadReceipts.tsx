/**
 * @fileoverview Message Read Receipts Component
 * @description Shows who has read a message and when
 */

// import React, { useState } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckCheck, Clock, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MessageReadStatus } from '@/types/messaging';

interface MessageReadReceiptsProps {
  readBy: MessageReadStatus[];
  sentAt: Date;
  currentUserId: string;
  className?: string;
}

/**
 * MessageReadReceipts component
 */
export function MessageReadReceipts({
  readBy,
  sentAt,
  currentUserId,
  className
}: MessageReadReceiptsProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter out current user from read receipts
  const readByOthers = readBy.filter(read => read.userId !== currentUserId);
  const readCount = readByOthers.length;

  // Format read time
  const formatReadTime = (readAt: Date) => {
    const now = new Date();
    const readTime = new Date(readAt);
    const diffInMinutes = (now.getTime() - readTime.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Şimdi';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} dk önce`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return readTime.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } 
      return readTime.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit',
        year: readTime.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    
  };

  // Get status icon
  const getStatusIcon = () => {
    if (readCount === 0) {
      return <Clock className="h-3 w-3 text-gray-400" />;
    } 
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    
  };

  // Get status text
  // const getStatusText = () => {
  //   if (readCount === 0) {
  //     return 'Gönderildi';
  //   } else if (readCount === 1) {
  //     return 'Okundu';
  //   } else {
  //     return `${readCount} kişi okudu`;
  //   }
  // };

  if (readByOthers.length === 0) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {getStatusIcon()}
        <span className="text-xs text-gray-500">
          {formatReadTime(sentAt)}
        </span>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setIsDetailsOpen(true); }}
        className={cn('h-auto p-0 hover:bg-transparent', className)}
      >
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className="text-xs text-gray-500">
            {formatReadTime(sentAt)}
          </span>
        </div>
      </Button>

      {/* Read receipts details modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Okuma Bilgileri
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message info */}
            <div className="text-sm text-gray-600">
              <p>Mesaj gönderildi: {formatReadTime(sentAt)}</p>
              <p>Okundu: {readCount} kişi</p>
            </div>

            {/* Read by list */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Kimler okudu:</h4>
              <div className="space-y-2">
                {readByOthers.map((read) => (
                  <div key={read.userId} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {read.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {read.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatReadTime(read.readAt)}
                      </p>
                    </div>
                    
                    <CheckCheck className="h-4 w-4 text-blue-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

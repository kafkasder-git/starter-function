/**
 * @fileoverview Typing Indicator Component
 * @description Shows when users are typing in a conversation
 */

// import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

/**
 * TypingIndicator component
 */
export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} yazıyor...`;
    } else if (users.length === 2) {
      return `${users[0]} ve ${users[1]} yazıyor...`;
    } 
      return `${users.length} kişi yazıyor...`;
    
  };

  return (
    <div className={cn('flex items-center gap-2 px-4 py-2', className)}>
      {/* Typing animation */}
      <div className="flex items-center gap-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      
      {/* Typing text */}
      <span className="text-sm text-gray-500 italic">
        {getTypingText()}
      </span>
    </div>
  );
}

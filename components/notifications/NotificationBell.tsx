/**
 * @fileoverview NotificationBell Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useNotificationStore } from '../../stores/notificationStore';
import { cn } from '../ui/utils';

import { logger } from '../../lib/logging/logger';
interface NotificationBellProps {
  className?: string;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'ghost' | 'outline';
}

/**
 * NotificationBell function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function NotificationBell({
  className,
  showBadge = true,
  size = 'md',
  variant = 'ghost',
}: NotificationBellProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastUnreadCount, setLastUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [_storeReady, setStoreReady] = useState(false);

  // Detect mobile safely
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Local state for animations
  const [_unreadCount, setUnreadCount] = useState(0);

  // Use the notification store directly
  const store = useNotificationStore();

  // Initialize store data
  useEffect(() => {
    setUnreadCount(store.unreadCount ?? 0);
    setStoreReady(true);
  }, [store]);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8 p-0',
      icon: 'w-4 h-4',
      badge: 'text-xs min-w-[16px] h-4 px-1',
    },
    md: {
      button: 'w-10 h-10 p-0',
      icon: 'w-5 h-5',
      badge: 'text-xs min-w-[18px] h-5 px-1.5',
    },
    lg: {
      button: 'w-12 h-12 p-0',
      icon: 'w-6 h-6',
      badge: 'text-sm min-w-[20px] h-6 px-2',
    },
  };

  const config = sizeConfig[size];

  // Animate when unread count increases
  useEffect(() => {
    if (store.unreadCount > lastUnreadCount && lastUnreadCount > 0) {
      setIsAnimating(true);

      // Stop animation after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }

    setLastUnreadCount(store.unreadCount);
  }, [store.unreadCount, lastUnreadCount]);

  const handleClick = () => {
    try {
      store.setShowNotificationCenter(true);
    } catch (error) {
      logger.error('Error opening notification center:', error);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Button
        variant={variant}
        className={cn(
          config.button,
          'relative transition-all duration-200 min-h-[44px] min-w-[44px] rounded-lg hover:bg-slate-100/80 focus-corporate',
          isAnimating && 'animate-pulse',
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            handleClick();
          } catch (error) {
            logger.error('Error opening notification center:', error);
          }
        }}
        aria-label={`Bildirimler ${store.unreadCount > 0 ? `(${store.unreadCount} okunmamış)` : ''}`}
        title={store.unreadCount > 0 ? `${store.unreadCount} okunmamış bildirim` : 'Bildirimler'}
      >
        <motion.div
          animate={
            isAnimating
              ? {
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, -5, 5, 0],
                }
              : {}
          }
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {store.unreadCount > 0 && isAnimating ? (
            <BellRing className={cn(config.icon, 'text-blue-600')} />
          ) : (
            <Bell className={cn(config.icon)} />
          )}
        </motion.div>

        {/* Notification Badge */}
        <AnimatePresence>
          {showBadge && store.unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1"
            >
              <Badge
                className={cn(
                  config.badge,
                  'bg-red-500 text-white border-2 border-white shadow-sm',
                  'flex items-center justify-center rounded-full',
                  store.unreadCount > 99 && 'px-1',
                )}
              >
                {store.unreadCount > 99 ? '99+' : store.unreadCount}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation for new notifications */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-0 border-2 border-blue-400 rounded-full"
            />
          )}
        </AnimatePresence>
      </Button>

      {/* Mobile-specific indicator */}
      {isMobile && store.unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"
        />
      )}
    </div>
  );
}

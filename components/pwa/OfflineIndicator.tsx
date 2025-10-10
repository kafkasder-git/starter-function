/**
 * @fileoverview OfflineIndicator Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
// Basit network monitoring - PWA kaldırıldı

// Environment detection
const isInFigma =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('figma.site') ||
    window.location.hostname.includes('figma.com') ||
    window.parent !== window);

// 🌐 Offline Indicator Component
// Elegant network status indicator with reconnection capabilities

interface OfflineIndicatorProps {
  className?: string;
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

/**
 * OfflineIndicator function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function OfflineIndicator({
  className = '',
  position = 'top',
  showDetails = false,
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);

  // Network bilgilerini güncelleyelim - PWA kaldırıldı
  const networkInfo = {
    isOnline,
    effectiveType: isInFigma ? 'wifi' : (navigator as any)?.connection?.effectiveType,
    connectionType: isInFigma ? 'wifi' : (navigator as any)?.connection?.type,
  };
  const [showReconnecting, setShowReconnecting] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Track network status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (networkInfo.isOnline) {
      setLastOnlineTime(new Date());
      setReconnectAttempts(0);
      setShowReconnecting(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [networkInfo.isOnline]);

  // Format time since last online
  const getTimeSinceOnline = () => {
    if (!lastOnlineTime || networkInfo.isOnline) return null;

    const now = new Date();
    const diff = Math.floor((now.getTime() - lastOnlineTime.getTime()) / 1000);

    if (diff < 60) return `${diff} saniye önce`;
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    return `${Math.floor(diff / 3600)} saat önce`;
  };

  // Handle reconnection attempt
  const handleReconnect = async () => {
    setShowReconnecting(true);
    setReconnectAttempts((prev) => prev + 1);

    // Simulate reconnection attempt
    try {
      // Try to fetch a small resource to test connectivity
      await fetch('/manifest.json', {
        cache: 'no-cache',
        mode: 'no-cors',
      });

      // If we get here, connection might be restored
      setTimeout(() => {
        setShowReconnecting(false);
      }, 1000);
    } catch (_error) {
      // Still offline
      setTimeout(() => {
        setShowReconnecting(false);
      }, 2000);
    }
  };

  // Get connection quality indicator
  const getConnectionQuality = () => {
    if (!networkInfo.isOnline) return null;

    const effectiveType = networkInfo.effectiveType?.toLowerCase();

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return { label: 'Yavaş', color: 'bg-red-500', strength: 1 };
      case '3g':
        return { label: 'Orta', color: 'bg-amber-500', strength: 2 };
      case '4g':
        return { label: 'Hızlı', color: 'bg-emerald-500', strength: 3 };
      case '5g':
        return { label: 'Çok Hızlı', color: 'bg-blue-500', strength: 4 };
      default:
        return { label: 'İyi', color: 'bg-emerald-500', strength: 3 };
    }
  };

  const connectionQuality = getConnectionQuality();
  const timeSinceOnline = getTimeSinceOnline();

  // Don't show if online and not showing details
  if (networkInfo.isOnline && !showDetails) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`
          fixed ${position === 'top' ? 'top-4' : 'bottom-4'}
          left-1/2 transform -translate-x-1/2 z-50 ${className}
        `}
      >
        <Card
          className={`
          ${
            networkInfo.isOnline
              ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800'
              : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
          }
          shadow-lg backdrop-blur-sm border-2
        `}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Status Icon */}
              <div
                className={`
                p-2 rounded-full ${
                  networkInfo.isOnline
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                    : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                }
              `}
              >
                {showReconnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : networkInfo.isOnline ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </div>

              {/* Status Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`
                    font-medium text-sm ${
                      networkInfo.isOnline
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-red-700 dark:text-red-300'
                    }
                  `}
                  >
                    {showReconnecting
                      ? 'Yeniden bağlanıyor...'
                      : networkInfo.isOnline
                        ? 'Bağlantı Aktif'
                        : 'Çevrimdışı Mod'}
                  </span>

                  {networkInfo.isOnline && connectionQuality && (
                    <Badge
                      variant="secondary"
                      className={`
                        ${connectionQuality.color} text-white text-xs px-2 py-0.5
                      `}
                    >
                      {connectionQuality.label}
                    </Badge>
                  )}
                </div>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground mt-1">
                  {networkInfo.isOnline ? (
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Temiz Frontend
                      </span>
                      {networkInfo.connectionType && networkInfo.connectionType !== 'unknown' && (
                        <span>Bağlantı: {networkInfo.connectionType.toUpperCase()}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      {timeSinceOnline && <span>Son bağlantı: {timeSinceOnline}</span>}
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        Çevrimdışı mod
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reconnect Button */}
              {!networkInfo.isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReconnect}
                  disabled={showReconnecting}
                  className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  {showReconnecting ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wifi className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>

            {/* Connection Quality Bars */}
            {networkInfo.isOnline && connectionQuality && showDetails && (
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                <span className="text-xs text-muted-foreground mr-2">Sinyal:</span>
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`
                      w-1 h-3 rounded-sm ${
                        bar <= connectionQuality.strength
                          ? connectionQuality.color
                          : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  {networkInfo.effectiveType?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            )}

            {/* Offline Features Notice */}
            {!networkInfo.isOnline && (
              <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Çevrimdışı modda çalışıyorsunuz. Veriler yerel olarak saklanmaktadır.
                    </p>
                    {reconnectAttempts > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Yeniden bağlantı denemesi: {reconnectAttempts}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// 🔍 Compact Network Status Badge
/**
 * NetworkStatusBadge function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function NetworkStatusBadge({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(navigator?.onLine ?? true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const networkInfo = {
    isOnline,
    effectiveType: isInFigma ? 'wifi' : (navigator as any)?.connection?.effectiveType,
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div
        className={`
        w-2 h-2 rounded-full ${networkInfo.isOnline ? 'bg-emerald-500' : 'bg-red-500'}
      `}
      />
      <span className="text-xs text-muted-foreground">
        {networkInfo.isOnline ? 'Online' : 'Offline'}
      </span>
      {networkInfo.isOnline && networkInfo.effectiveType && (
        <span className="text-xs text-muted-foreground">
          ({networkInfo.effectiveType.toUpperCase()})
        </span>
      )}
    </div>
  );
}

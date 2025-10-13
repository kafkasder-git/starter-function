/**
 * @fileoverview PerformanceIndicator Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { AlertTriangle, Cpu, Wifi, WifiOff, Battery, BatteryLow } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from './badge';
import { useMobilePerformance } from '../../hooks/useMobilePerformance';

interface PerformanceIndicatorProps {
  className?: string;
  showNetwork?: boolean;
  showMemory?: boolean;
  showBattery?: boolean;
}

export function PerformanceIndicator({
  className = '',
  showNetwork = true,
  showMemory = true,
  showBattery = true,
}: PerformanceIndicatorProps) {
  const [networkStatus, setNetworkStatus] = useState<'fast' | 'medium' | 'slow' | 'offline'>(
    'fast'
  );
  const [memoryStatus, setMemoryStatus] = useState<'good' | 'warning' | 'critical'>('good');
  const [batteryStatus, setBatteryStatus] = useState<'good' | 'low' | 'critical'>('good');

  const { metrics } = useMobilePerformance();

  // Network status monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      if (!navigator.onLine) {
        setNetworkStatus('offline');
        return;
      }

      // Simple network speed detection
      const { connection } = navigator as any;
      if (connection) {
        const { effectiveType } = connection;
        if (effectiveType === '4g') {
          setNetworkStatus('fast');
        } else if (effectiveType === '3g') {
          setNetworkStatus('medium');
        } else {
          setNetworkStatus('slow');
        }
      } else {
        setNetworkStatus('fast');
      }
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Memory status monitoring
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;

        if (memoryRatio > 0.9) {
          setMemoryStatus('critical');
        } else if (memoryRatio > 0.8) {
          setMemoryStatus('warning');
        } else {
          setMemoryStatus('good');
        }
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Battery status monitoring
  useEffect(() => {
    const checkBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          if (battery.level < 0.1) {
            setBatteryStatus('critical');
          } else if (battery.level < 0.2) {
            setBatteryStatus('low');
          } else {
            setBatteryStatus('good');
          }
        } catch (error) {
          // Battery API not supported
        }
      }
    };

    checkBattery();
  }, []);

  const getNetworkBadge = () => {
    switch (networkStatus) {
      case 'fast':
        return null; // Don't show for fast network
      case 'medium':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Wifi className="w-3 h-3" />
            Orta hız
          </Badge>
        );
      case 'slow':
        return (
          <Badge variant="destructive" size="sm" className="gap-1">
            <Wifi className="w-3 h-3" />
            Yavaş bağlantı
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive" size="sm" className="gap-1">
            <WifiOff className="w-3 h-3" />
            Çevrimdışı
          </Badge>
        );
    }
  };

  const getMemoryBadge = () => {
    switch (memoryStatus) {
      case 'good':
        return null; // Don't show for good memory
      case 'warning':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <Cpu className="w-3 h-3" />
            Bellek düşük
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive" size="sm" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Bellek kritik
          </Badge>
        );
    }
  };

  const getBatteryBadge = () => {
    switch (batteryStatus) {
      case 'good':
        return null; // Don't show for good battery
      case 'low':
        return (
          <Badge variant="warning" size="sm" className="gap-1">
            <BatteryLow className="w-3 h-3" />
            Pil düşük
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive" size="sm" className="gap-1">
            <Battery className="w-3 h-3" />
            Pil kritik
          </Badge>
        );
    }
  };

  const indicators = [
    showNetwork && getNetworkBadge(),
    showMemory && getMemoryBadge(),
    showBattery && getBatteryBadge(),
  ].filter(Boolean);

  if (indicators.length === 0) return null;

  return <div className={`flex items-center gap-2 ${className}`}>{indicators}</div>;
}

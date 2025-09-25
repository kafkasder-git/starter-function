import { useEffect, useState, useCallback } from 'react';
import { useIsMobile } from './useTouchDevice';

interface PerformanceMetrics {
  isSlowDevice: boolean;
  networkSpeed: 'slow' | 'medium' | 'fast';
  battery: {
    level: number;
    charging: boolean;
  } | null;
  reducedMotion: boolean;
  dataSaver: boolean;
}

interface MobilePerformanceSettings {
  enableAnimations: boolean;
  enableHeavyEffects: boolean;
  enableAutoRefresh: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  lazyLoadThreshold: number;
}

export function useMobilePerformance() {
  const isMobile = useIsMobile();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isSlowDevice: false,
    networkSpeed: 'medium',
    battery: null,
    reducedMotion: false,
    dataSaver: false,
  });

  const [settings, setSettings] = useState<MobilePerformanceSettings>({
    enableAnimations: true,
    enableHeavyEffects: true,
    enableAutoRefresh: true,
    imageQuality: 'high',
    lazyLoadThreshold: 300,
  });

  // Detect device performance
  useEffect(() => {
    if (!isMobile) return;

    const detectDevicePerformance = () => {
      // Check device memory (if available)
      const memory = (navigator as any).deviceMemory;
      const {hardwareConcurrency} = navigator;

      // Simple heuristic for device performance
      const isSlowDevice = memory ? memory <= 2 : hardwareConcurrency <= 2;

      setMetrics((prev) => ({ ...prev, isSlowDevice }));
    };

    detectDevicePerformance();
  }, [isMobile]);

  // Monitor network connection
  useEffect(() => {
    if (!isMobile || !('connection' in navigator)) return;

    const {connection} = (navigator as any);

    const updateNetworkSpeed = () => {
      const effectiveType = connection?.effectiveType;
      let speed: 'slow' | 'medium' | 'fast' = 'medium';

      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        speed = 'slow';
      } else if (effectiveType === '3g') {
        speed = 'medium';
      } else if (effectiveType === '4g') {
        speed = 'fast';
      }

      setMetrics((prev) => ({
        ...prev,
        networkSpeed: speed,
        dataSaver: connection?.saveData || false,
      }));
    };

    updateNetworkSpeed();
    connection?.addEventListener('change', updateNetworkSpeed);

    return () => connection?.removeEventListener('change', updateNetworkSpeed);
  }, [isMobile]);

  // Monitor battery status
  useEffect(() => {
    if (!isMobile || !('getBattery' in navigator)) return;

    const updateBatteryInfo = async () => {
      try {
        const battery = await (navigator as any).getBattery();

        const updateBattery = () => {
          setMetrics((prev) => ({
            ...prev,
            battery: {
              level: Math.round(battery.level * 100),
              charging: battery.charging,
            },
          }));
        };

        updateBattery();

        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);

        return () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      } catch (error) {
        // Battery API not supported
      }
    };

    updateBatteryInfo();
  }, [isMobile]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setMetrics((prev) => ({ ...prev, reducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setMetrics((prev) => ({ ...prev, reducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Auto-adjust settings based on metrics
  useEffect(() => {
    const newSettings: MobilePerformanceSettings = {
      enableAnimations: !metrics.reducedMotion && !metrics.isSlowDevice,
      enableHeavyEffects: !metrics.isSlowDevice && metrics.networkSpeed !== 'slow',
      enableAutoRefresh: !metrics.dataSaver && metrics.networkSpeed !== 'slow',
      imageQuality:
        metrics.networkSpeed === 'slow'
          ? 'low'
          : metrics.networkSpeed === 'medium'
            ? 'medium'
            : 'high',
      lazyLoadThreshold:
        metrics.networkSpeed === 'slow' ? 100 : metrics.networkSpeed === 'medium' ? 200 : 300,
    };

    // Reduce performance if battery is low and not charging
    if (metrics.battery && metrics.battery.level < 20 && !metrics.battery.charging) {
      newSettings.enableAnimations = false;
      newSettings.enableHeavyEffects = false;
      newSettings.enableAutoRefresh = false;
      newSettings.imageQuality = 'low';
    }

    setSettings(newSettings);
  }, [metrics]);

  // Get optimized component props
  const getOptimizedProps = useCallback(
    (componentType: 'image' | 'animation' | 'autoRefresh') => {
      switch (componentType) {
        case 'image':
          return {
            loading: 'lazy' as const,
            quality: settings.imageQuality,
            threshold: settings.lazyLoadThreshold,
          };

        case 'animation':
          return {
            animate: settings.enableAnimations,
            duration: settings.enableAnimations ? (metrics.isSlowDevice ? 0.15 : 0.3) : 0,
            reduce: metrics.reducedMotion,
          };

        case 'autoRefresh':
          return {
            enabled: settings.enableAutoRefresh,
            interval: metrics.networkSpeed === 'slow' ? 60000 : 30000,
          };

        default:
          return {};
      }
    },
    [settings, metrics],
  );

  // Performance-aware CSS classes
  const getPerformanceClasses = useCallback(() => {
    const classes: string[] = [];

    if (!settings.enableAnimations) {
      classes.push('reduce-motion');
    }

    if (metrics.isSlowDevice) {
      classes.push('slow-device');
    }

    if (metrics.networkSpeed === 'slow') {
      classes.push('slow-network');
    }

    if (metrics.dataSaver) {
      classes.push('data-saver');
    }

    return classes.join(' ');
  }, [settings, metrics]);

  // Manual settings override
  const updateSettings = useCallback((newSettings: Partial<MobilePerformanceSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    metrics,
    settings,
    getOptimizedProps,
    getPerformanceClasses,
    updateSettings,
    isMobile,
  };
}

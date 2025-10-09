/**
 * @fileoverview Network Status Component
 * @description Real-time network status indicator and diagnostics
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Server,
  Globe
} from 'lucide-react';
import { NetworkManager } from '../lib/networkDiagnostics';
import type { NetworkDiagnostics, NetworkError } from '../lib/networkDiagnostics';

interface NetworkStatusProps {
  showDetails?: boolean;
  compact?: boolean;
  onStatusChange?: (diagnostics: NetworkDiagnostics) => void;
}

export function NetworkStatus({ 
  showDetails = false, 
  compact = false,
  onStatusChange 
}: NetworkStatusProps) {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics>({
    isOnline: navigator.onLine,
    canReachSupabase: false,
    canReachInternet: false,
    connectionQuality: 'offline'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [error, setError] = useState<NetworkError | null>(null);

  const networkManager = NetworkManager.getInstance();

  const checkConnectivity = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const newDiagnostics = await networkManager.testConnectivity();
      setDiagnostics(newDiagnostics);
      setLastCheck(new Date());
      onStatusChange?.(newDiagnostics);
    } catch (err) {
      setError(err as NetworkError);
    } finally {
      setIsChecking(false);
    }
  }, [networkManager, onStatusChange]);

  // Initial check and periodic updates
  useEffect(() => {
    checkConnectivity();

    // Check every 30 seconds
    const interval = setInterval(checkConnectivity, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      setDiagnostics(prev => ({ ...prev, isOnline: true }));
      checkConnectivity();
    };

    const handleOffline = () => {
      setDiagnostics(prev => ({ 
        ...prev, 
        isOnline: false,
        canReachSupabase: false,
        canReachInternet: false,
        connectionQuality: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnectivity]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }

    if (!diagnostics.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }

    if (diagnostics.connectionQuality === 'excellent') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (diagnostics.connectionQuality === 'good') {
      return <Wifi className="h-4 w-4 text-yellow-500" />;
    }

    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  };

  const getStatusText = () => {
    if (isChecking) return 'Kontrol Ediliyor...';
    if (!diagnostics.isOnline) return 'Çevrimdışı';
    if (diagnostics.connectionQuality === 'excellent') return 'Bağlantı Mükemmel';
    if (diagnostics.connectionQuality === 'good') return 'Bağlantı İyi';
    if (diagnostics.connectionQuality === 'poor') return 'Bağlantı Zayıf';
    return 'Bağlantı Problemi';
  };

  const getStatusColor = () => {
    if (isChecking) return 'bg-blue-100 text-blue-800';
    if (!diagnostics.isOnline) return 'bg-red-100 text-red-800';
    if (diagnostics.connectionQuality === 'excellent') return 'bg-green-100 text-green-800';
    if (diagnostics.connectionQuality === 'good') return 'bg-yellow-100 text-yellow-800';
    if (diagnostics.connectionQuality === 'poor') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <Badge variant="secondary" className={getStatusColor()}>
          {getStatusText()}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={checkConnectivity}
          disabled={isChecking}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <Alert className={`mb-4 ${!diagnostics.isOnline ? 'border-red-200 bg-red-50' : ''}`}>
        {getStatusIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span>{getStatusText()}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={checkConnectivity}
            disabled={isChecking}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Ağ Durumu
          <Button
            size="sm"
            variant="ghost"
            onClick={checkConnectivity}
            disabled={isChecking}
            className="h-6 w-6 p-0 ml-auto"
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Son kontrol: {lastCheck.toLocaleTimeString('tr-TR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Genel Durum:</span>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </div>

        {/* Internet Connection */}
        <div className="flex items-center justify-between">
          <span className="text-sm">İnternet Bağlantısı:</span>
          <div className="flex items-center gap-2">
            {diagnostics.isOnline ? (
              <Globe className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {diagnostics.isOnline ? 'Bağlı' : 'Bağlantı Yok'}
            </span>
          </div>
        </div>

        {/* Supabase Connection */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Supabase Bağlantısı:</span>
          <div className="flex items-center gap-2">
            {diagnostics.canReachSupabase ? (
              <Server className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {diagnostics.canReachSupabase ? 'Erişilebilir' : 'Erişilemiyor'}
            </span>
          </div>
        </div>

        {/* Connection Quality */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Bağlantı Kalitesi:</span>
          <Badge variant="outline" className="text-xs">
            {diagnostics.connectionQuality === 'excellent' && 'Mükemmel'}
            {diagnostics.connectionQuality === 'good' && 'İyi'}
            {diagnostics.connectionQuality === 'poor' && 'Zayıf'}
            {diagnostics.connectionQuality === 'offline' && 'Çevrimdışı'}
          </Badge>
        </div>

        {/* Last Error */}
        {error && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Son Hata:</div>
              <div className="text-sm mt-1">{error.message}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Troubleshooting Tips */}
        {!diagnostics.isOnline && (
          <Alert className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Çözüm Önerileri:</div>
              <ul className="text-sm mt-1 list-disc list-inside space-y-1">
                <li>İnternet bağlantınızı kontrol edin</li>
                <li>Wi-Fi bağlantısını yeniden başlatın</li>
                <li>Mobil veri kullanmayı deneyin</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default NetworkStatus;

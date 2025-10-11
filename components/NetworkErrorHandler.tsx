/**
 * @fileoverview Network Error Handler Component
 * @description Handles NetworkError cases with user-friendly messages and recovery options
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, WifiOff, RefreshCw, Home, Wifi } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { NetworkManager } from '../lib/networkDiagnostics';
import { logger } from '../lib/logging/logger';

interface NetworkErrorHandlerProps {
  error?: Error;
  onRetry?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function NetworkErrorHandler({
  error,
  onRetry,
  onGoHome,
  showDetails = false,
  className = ''
}: NetworkErrorHandlerProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<{
    isOnline: boolean;
    canReachAppwrite: boolean;
    canReachInternet: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  }>({
    isOnline: navigator.onLine,
    canReachAppwrite: false,
    canReachInternet: false,
    connectionQuality: 'offline'
  });
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const networkManager = NetworkManager.getInstance();

  const checkNetworkStatus = async () => {
    try {
      const diagnostics = await networkManager.testConnectivity();
      setNetworkStatus(diagnostics);
      setLastCheck(new Date());
    } catch (err) {
      logger.error('Network status check failed:', err);
    }
  };

  useEffect(() => {
    checkNetworkStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setNetworkStatus(prev => ({ ...prev, isOnline: true }));
      checkNetworkStatus();
    };

    const handleOffline = () => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: false,
        canReachAppwrite: false,
        canReachInternet: false,
        connectionQuality: 'offline'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetworkStatus]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await checkNetworkStatus();
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } catch (err) {
      logger.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const getErrorIcon = () => {
    if (!networkStatus.isOnline) {
      return <WifiOff className="h-8 w-8 text-red-500" />;
    }
    if (!networkStatus.canReachAppwrite) {
      return <AlertTriangle className="h-8 w-8 text-orange-500" />;
    }
    return <Wifi className="h-8 w-8 text-yellow-500" />;
  };

  const getErrorMessage = () => {
    if (!networkStatus.isOnline) {
      return 'İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin.';
    }
    if (!networkStatus.canReachAppwrite) {
      return 'Sunucuya bağlanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.';
    }
    if (error?.message.includes('Failed to fetch')) {
      return 'Ağ isteği başarısız oldu. Lütfen bağlantınızı kontrol edin.';
    }
    return 'Ağ hatası oluştu. Lütfen tekrar deneyin.';
  };

  const getSuggestedActions = () => {
    const actions = [];
    
    if (!networkStatus.isOnline) {
      actions.push('İnternet bağlantınızı kontrol edin');
      actions.push('Wi-Fi veya mobil veri bağlantısını kontrol edin');
    } else if (!networkStatus.canReachAppwrite) {
      actions.push('Sunucu geçici olarak kullanılamıyor olabilir');
      actions.push('Birkaç dakika sonra tekrar deneyin');
    } else {
      actions.push('Sayfayı yenileyin (F5)');
      actions.push('Tarayıcı önbelleğini temizleyin');
    }
    
    return actions;
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] p-6 ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getErrorIcon()}
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Bağlantı Hatası
          </CardTitle>
          <CardDescription>
            {getErrorMessage()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Network Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>İnternet Bağlantısı:</span>
              <span className={networkStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                {networkStatus.isOnline ? 'Bağlı' : 'Bağlantı Yok'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Sunucu Bağlantısı:</span>
              <span className={networkStatus.canReachAppwrite ? 'text-green-600' : 'text-red-600'}>
                {networkStatus.canReachAppwrite ? 'Bağlı' : 'Bağlantı Yok'}
              </span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Son kontrol: {lastCheck.toLocaleTimeString('tr-TR')}
            </div>
          </div>

          {/* Suggested Actions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Önerilen Çözümler</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {getSuggestedActions().map((action, index) => (
                  <li key={index} className="text-sm">{action}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Yeniden Deneniyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </div>

          {/* Error Details (if enabled) */}
          {showDetails && error && (
            <details className="mt-4">
              <summary className="text-sm text-gray-600 cursor-pointer">
                Teknik Detaylar
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                <div><strong>Hata:</strong> {error.message}</div>
                <div><strong>Tür:</strong> {error.name}</div>
                {error.stack && (
                  <div className="mt-2">
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap text-xs mt-1">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default NetworkErrorHandler;

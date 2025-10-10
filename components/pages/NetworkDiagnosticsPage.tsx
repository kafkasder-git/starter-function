/**
 * @fileoverview Network Diagnostics Page
 * @description Comprehensive network diagnostics and troubleshooting page
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Wifi, 
  WifiOff, 
  Server, 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';
import type { NetworkDiagnostics, NetworkError } from '../../lib/networkDiagnostics';
import { NetworkManager } from '../../lib/networkDiagnostics';
import { enhancedSupabase } from '../../services/enhancedSupabaseService';
import { logger } from '../../lib/logging/logger';

export function NetworkDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics>({
    isOnline: navigator.onLine,
    canReachSupabase: false,
    canReachInternet: false,
    connectionQuality: 'offline'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [errors, setErrors] = useState<NetworkError[]>([]);
  const [supabaseConnection, setSupabaseConnection] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);

  const networkManager = NetworkManager.getInstance();

  const runFullDiagnostics = async () => {
    setIsRunning(true);
    setErrors([]);
    
    try {
      // Run network diagnostics
      const networkDiag = await networkManager.testConnectivity();
      setDiagnostics(networkDiag);
      
      // Test Supabase connection
      const supabaseTest = await enhancedSupabase.testConnection();
      setSupabaseConnection(supabaseTest);
      
      setLastCheck(new Date());
      
      logger.info('Network diagnostics completed:', {
        network: networkDiag,
        supabase: supabaseTest
      });
      
    } catch (error) {
      const networkError: NetworkError = {
        type: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'Diagnostics failed',
        details: error
      };
      setErrors(prev => [...prev, networkError]);
      logger.error('Network diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runFullDiagnostics();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getQualityBadge = (quality: string) => {
    const variants = {
      'excellent': { variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'good': { variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
      'poor': { variant: 'default' as const, className: 'bg-orange-100 text-orange-800' },
      'offline': { variant: 'destructive' as const, className: 'bg-red-100 text-red-800' }
    };
    
    const config = variants[quality as keyof typeof variants] || variants.offline;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {quality === 'excellent' && 'Mükemmel'}
        {quality === 'good' && 'İyi'}
        {quality === 'poor' && 'Zayıf'}
        {quality === 'offline' && 'Çevrimdışı'}
      </Badge>
    );
  };

  const getTroubleshootingSteps = () => {
    const steps = [];

    if (!diagnostics.isOnline) {
      steps.push('İnternet bağlantınızı kontrol edin');
      steps.push('Wi-Fi bağlantısını yeniden başlatın');
      steps.push('Mobil veri kullanmayı deneyin');
    } else if (!diagnostics.canReachInternet) {
      steps.push('Güvenlik duvarı ayarlarınızı kontrol edin');
      steps.push('VPN bağlantınızı kapatmayı deneyin');
      steps.push('Proxy ayarlarınızı kontrol edin');
    } else if (!diagnostics.canReachSupabase) {
      steps.push('Supabase sunucuları bakım modunda olabilir');
      steps.push('Güvenlik duvarı Supabase erişimini engelliyor olabilir');
      steps.push('DNS ayarlarınızı kontrol edin');
    }

    return steps;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ağ Tanılaması</h1>
          <p className="text-gray-600 mt-2">
            Bağlantı durumunuzu kontrol edin ve sorunları giderin
          </p>
        </div>
        <Button
          onClick={runFullDiagnostics}
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Kontrol Ediliyor...' : 'Yeniden Kontrol Et'}
        </Button>
      </div>

      {lastCheck && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Son kontrol: {lastCheck.toLocaleString('tr-TR')}
          </AlertDescription>
        </Alert>
      )}

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Genel Durum
          </CardTitle>
          <CardDescription>
            Sistem bağlantı durumu özeti
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {diagnostics.isOnline ? (
                  <Wifi className="h-6 w-6 text-green-500" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <div className="font-medium">İnternet</div>
                  <div className="text-sm text-gray-500">
                    {diagnostics.isOnline ? 'Bağlı' : 'Bağlantı Yok'}
                  </div>
                </div>
              </div>
              {getStatusIcon(diagnostics.isOnline)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-medium">İnternet Erişimi</div>
                  <div className="text-sm text-gray-500">
                    {diagnostics.canReachInternet ? 'Erişilebilir' : 'Erişilemiyor'}
                  </div>
                </div>
              </div>
              {getStatusIcon(diagnostics.canReachInternet)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="h-6 w-6 text-purple-500" />
                <div>
                  <div className="font-medium">Supabase</div>
                  <div className="text-sm text-gray-500">
                    {diagnostics.canReachSupabase ? 'Erişilebilir' : 'Erişilemiyor'}
                  </div>
                </div>
              </div>
              {getStatusIcon(diagnostics.canReachSupabase)}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="font-medium">Bağlantı Kalitesi:</span>
            {getQualityBadge(diagnostics.connectionQuality)}
          </div>
        </CardContent>
      </Card>

      {/* Supabase Connection Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Supabase Bağlantı Detayları
          </CardTitle>
          <CardDescription>
            Veritabanı bağlantısı ve kimlik doğrulama durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {supabaseConnection ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Bağlantı Durumu:</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(supabaseConnection.connected)}
                  <span className={supabaseConnection.connected ? 'text-green-600' : 'text-red-600'}>
                    {supabaseConnection.connected ? 'Bağlı' : 'Bağlantı Yok'}
                  </span>
                </div>
              </div>
              
              {supabaseConnection.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Bağlantı Hatası</AlertTitle>
                  <AlertDescription>
                    <code className="text-sm bg-red-50 p-2 rounded block mt-2">
                      {supabaseConnection.error}
                    </code>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Bağlantı test ediliyor...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Yapılandırma Bilgileri</CardTitle>
          <CardDescription>
            Mevcut ağ ve uygulama yapılandırması
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium text-sm text-gray-500">Supabase URL</div>
              <div className="text-sm font-mono bg-gray-50 p-2 rounded">
                {import.meta.env.VITE_SUPABASE_URL || 'Tanımlanmamış'}
              </div>
            </div>
            <div>
              <div className="font-medium text-sm text-gray-500">Anon Key</div>
              <div className="text-sm font-mono bg-gray-50 p-2 rounded truncate">
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 
                  `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
                  'Tanımlanmamış'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      {getTroubleshootingSteps().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Sorun Giderme Adımları
            </CardTitle>
            <CardDescription>
              Tespit edilen sorunlar için önerilen çözümler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getTroubleshootingSteps().map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recent Errors */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Son Hatalar
            </CardTitle>
            <CardDescription>
              Tanılama sırasında tespit edilen hatalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{error.type}</AlertTitle>
                  <AlertDescription>
                    <div className="text-sm">{error.message}</div>
                    {error.url && (
                      <div className="text-xs mt-1 font-mono bg-red-50 p-1 rounded">
                        URL: {error.url}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default NetworkDiagnosticsPage;

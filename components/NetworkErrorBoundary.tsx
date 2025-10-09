/**
 * @fileoverview Network Error Boundary Component
 * @description Specialized error boundary for handling network-related errors
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RefreshCw, Wifi, WifiOff, AlertTriangle, Server, Shield } from 'lucide-react';
import { NetworkManager, getUserFriendlyErrorMessage, isRetryableError } from '../lib/networkDiagnostics';
import type { NetworkError } from '../lib/networkDiagnostics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: NetworkError | null;
  isRetrying: boolean;
  diagnostics: any;
}

export class NetworkErrorBoundary extends Component<Props, State> {
  private networkManager: NetworkManager;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isRetrying: false,
      diagnostics: null
    };
    this.networkManager = NetworkManager.getInstance();
  }

  static override getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a network-related error
    const isNetworkError = error.message.includes('Failed to fetch') || 
                          error.message.includes('NetworkError') ||
                          error.message.includes('TypeError: Failed to fetch');

    if (isNetworkError) {
      const networkError: NetworkError = {
        type: 'NETWORK_ERROR',
        message: error.message,
        details: error
      };

      return {
        hasError: true,
        error: networkError
      };
    }

    return {
      hasError: true,
      error: {
        type: 'UNKNOWN_ERROR',
        message: error.message,
        details: error
      }
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Network Error Boundary caught an error:', error, errorInfo);
    
    // Run diagnostics
    this.runDiagnostics();
  }

  private async runDiagnostics() {
    try {
      const diagnostics = await this.networkManager.testConnectivity();
      this.setState({ diagnostics });
    } catch (error) {
      console.error('Failed to run network diagnostics:', error);
    }
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true });

    try {
      // Run connectivity test
      const diagnostics = await this.networkManager.testConnectivity();
      this.setState({ diagnostics });

      // If connectivity is restored, reset error boundary
      if (diagnostics.canReachInternet && diagnostics.canReachSupabase) {
        this.setState({
          hasError: false,
          error: null,
          isRetrying: false
        });
      } else {
        this.setState({ isRetrying: false });
      }
    } catch (error) {
      console.error('Retry failed:', error);
      this.setState({ isRetrying: false });
    }
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private getErrorIcon = (error: NetworkError) => {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return <WifiOff className="h-8 w-8 text-red-500" />;
      case 'CORS_ERROR':
        return <Shield className="h-8 w-8 text-yellow-500" />;
      case 'TIMEOUT_ERROR':
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      case 'AUTH_ERROR':
        return <Shield className="h-8 w-8 text-red-500" />;
      case 'SERVER_ERROR':
        return <Server className="h-8 w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-gray-500" />;
    }
  };

  private getDiagnosticsInfo = () => {
    const { diagnostics } = this.state;
    if (!diagnostics) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm">Bağlantı Durumu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            {diagnostics.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              İnternet: {diagnostics.isOnline ? 'Bağlı' : 'Bağlantı Yok'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {diagnostics.canReachSupabase ? (
              <Server className="h-4 w-4 text-green-500" />
            ) : (
              <Server className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              Supabase: {diagnostics.canReachSupabase ? 'Erişilebilir' : 'Erişilemiyor'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Bağlantı Kalitesi: {this.getConnectionQualityText(diagnostics.connectionQuality)}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  private getConnectionQualityText = (quality: string) => {
    const qualityMap = {
      'excellent': 'Mükemmel',
      'good': 'İyi',
      'poor': 'Zayıf',
      'offline': 'Çevrimdışı'
    };
    return qualityMap[quality as keyof typeof qualityMap] || 'Bilinmiyor';
  };

  private getSuggestedActions = (error: NetworkError) => {
    const actions = [];

    if (error.type === 'NETWORK_ERROR') {
      actions.push('İnternet bağlantınızı kontrol edin');
      actions.push('Wi-Fi veya mobil veri bağlantısını yeniden başlatın');
      actions.push('Güvenlik duvarı ayarlarınızı kontrol edin');
    } else if (error.type === 'AUTH_ERROR') {
      actions.push('Çıkış yapıp tekrar giriş yapın');
      actions.push('Tarayıcı çerezlerini temizleyin');
    } else if (error.type === 'SERVER_ERROR') {
      actions.push('Birkaç dakika bekleyip tekrar deneyin');
      actions.push('Sunucu bakım modunda olabilir');
    } else if (error.type === 'CORS_ERROR') {
      actions.push('Güvenlik ayarlarınızı kontrol edin');
      actions.push('VPN kullanıyorsanız kapatmayı deneyin');
    }

    return actions;
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { error } = this.state;
      const userMessage = getUserFriendlyErrorMessage(error);
      const suggestedActions = this.getSuggestedActions(error);
      const canRetry = isRetryableError(error);

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {this.getErrorIcon(error)}
              </div>
              <CardTitle className="text-2xl text-red-600">
                Bağlantı Hatası
              </CardTitle>
              <CardDescription className="text-lg">
                {userMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Error Details */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Teknik Detaylar</AlertTitle>
                <AlertDescription>
                  <code className="text-sm bg-red-50 p-2 rounded block mt-2">
                    {error.message}
                  </code>
                  {error.url && (
                    <div className="mt-2 text-sm">
                      <strong>URL:</strong> {error.url}
                    </div>
                  )}
                  {error.status && (
                    <div className="text-sm">
                      <strong>Durum Kodu:</strong> {error.status} {error.statusText}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {/* Suggested Actions */}
              {suggestedActions.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Önerilen Çözümler</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      {suggestedActions.map((action, index) => (
                        <li key={index} className="text-sm">{action}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                    {this.state.isRetrying ? 'Kontrol Ediliyor...' : 'Tekrar Dene'}
                  </Button>
                )}
                <Button
                  onClick={this.handleRefresh}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sayfayı Yenile
                </Button>
              </div>

              {/* Diagnostics */}
              {this.getDiagnosticsInfo()}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default NetworkErrorBoundary;

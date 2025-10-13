/**
 * @fileoverview Unified ErrorBoundary Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { AlertTriangle, Home, RefreshCw, Wifi, WifiOff, Shield, Server } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  NetworkManager,
  getUserFriendlyErrorMessage,
  isRetryableError,
  type NetworkError,
} from '../../lib/networkDiagnostics';

import { logger } from '../../lib/logging/logger';

interface Props {
  children: ReactNode;
  type?: 'general' | 'network' | 'store' | 'notification' | 'component';
  fallback?: ReactNode;
  componentName?: string; // For 'component' type
  onRetry?: () => void | Promise<void>;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRetrying?: boolean;
  diagnostics?: any;
}

/**
 * Unified ErrorBoundary Service
 *
 * Service class for handling all types of error boundary operations
 *
 * @class ErrorBoundary
 */
export class ErrorBoundary extends Component<Props, State> {
  private readonly networkManager?: NetworkManager;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };

    // Initialize NetworkManager only for network type
    if (props.type === 'network') {
      this.networkManager = NetworkManager.getInstance();
    }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorType = this.props.type || 'general';
    logger.error(`${errorType} error boundary caught:`, error, errorInfo);
    this.setState({ errorInfo });

    // Run diagnostics for network errors
    if (this.props.type === 'network') {
      this.runDiagnostics();
    }
  }

  private async runDiagnostics() {
    if (!this.networkManager) return;

    try {
      const diagnostics = await this.networkManager.testConnectivity();
      this.setState({ diagnostics });
    } catch (error) {
      logger.error('Failed to run network diagnostics:', error);
    }
  }

  private readonly handleRetry = async () => {
    const { type, onRetry } = this.props;

    if (type === 'network' && this.networkManager) {
      this.setState({ isRetrying: true });

      try {
        const diagnostics = await this.networkManager.testConnectivity();
        this.setState({ diagnostics });

        if (diagnostics.canReachInternet && diagnostics.canReachAppwrite) {
          this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            isRetrying: false,
          });
        } else {
          this.setState({ isRetrying: false });
        }
      } catch (error) {
        logger.error('Retry failed:', error);
        this.setState({ isRetrying: false });
      }
    } else if (onRetry) {
      await onRetry();
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    } else {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  };

  private readonly handleGoHome = () => {
    window.location.href = '/';
  };

  private readonly handleRefresh = () => {
    window.location.reload();
  };

  private readonly getErrorIcon = (error: NetworkError) => {
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
      case 'UNKNOWN_ERROR':
        return <AlertTriangle className="h-8 w-8 text-gray-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-gray-500" />;
    }
  };

  private readonly getDiagnosticsInfo = () => {
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
            {diagnostics.canReachAppwrite ? (
              <Server className="h-4 w-4 text-green-500" />
            ) : (
              <Server className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              Appwrite: {diagnostics.canReachAppwrite ? 'Erişilebilir' : 'Erişilemiyor'}
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

  private readonly getConnectionQualityText = (quality: string) => {
    const qualityMap = {
      excellent: 'Mükemmel',
      good: 'İyi',
      poor: 'Zayıf',
      offline: 'Çevrimdışı',
    };
    return qualityMap[quality as keyof typeof qualityMap] || 'Bilinmiyor';
  };

  private readonly getSuggestedActions = (error: NetworkError) => {
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

  private renderGeneralError() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-800">Bir Hata Oluştu</CardTitle>
            <p className="mt-2 text-red-600">Beklenmeyen bir hata ile karşılaştık</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button onClick={this.handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Tekrar Dene
              </Button>

              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Ana Sayfaya Dön
              </Button>
            </div>

            {this.state.error && (
              <div className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-600">
                <strong>Hata:</strong> {this.state.error.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  private renderNetworkError() {
    const error = (this.state.error ||
      new Error('Unknown network error')) as unknown as NetworkError;
    const userMessage = getUserFriendlyErrorMessage(error);
    const suggestedActions = this.getSuggestedActions(error);
    const canRetry = isRetryableError(error);

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">{this.getErrorIcon(error)}</div>
            <CardTitle className="text-2xl text-red-600">Bağlantı Hatası</CardTitle>
            <CardDescription className="text-lg">{userMessage}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Details */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Teknik Detaylar</AlertTitle>
              <AlertDescription>
                <code className="mt-2 block rounded bg-red-50 p-2 text-sm">{error.message}</code>
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
                  <ul className="mt-2 list-inside list-disc space-y-1">
                    {suggestedActions.map((action, index) => (
                      <li key={index} className="text-sm">
                        {action}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
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

  private renderStoreError() {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
        <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg">
          <div className="text-lg font-medium text-red-600">Sistem Başlatılamadı</div>
          <div className="max-w-md text-center text-sm text-gray-600">
            Uygulama başlatılırken bir hata oluştu. Sayfayı yenilemeyi deneyin.
          </div>
          <button
            onClick={this.handleRefresh}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  private renderNotificationError() {
    return <div className="p-2 text-xs text-gray-500">Bildirimler yüklenemiyor</div>;
  }

  private renderComponentError() {
    const componentName = this.props.componentName || 'Component';

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="font-medium text-red-800">Bileşen Yükleme Hatası</h3>
        <p className="mt-1 text-sm text-red-600">
          {componentName} bileşeni yüklenirken bir hata oluştu.
        </p>
        <button
          onClick={() => {
            this.setState({ hasError: false });
          }}
          className="mt-2 rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const type = this.props.type || 'general';

      switch (type) {
        case 'network':
          return this.renderNetworkError();
        case 'store':
          return this.renderStoreError();
        case 'notification':
          return this.renderNotificationError();
        case 'component':
          return this.renderComponentError();
        case 'general':
        default:
          return this.renderGeneralError();
      }
    }

    return this.props.children;
  }
}

// HOC for error boundary with options
/**
 * withErrorBoundary function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    type?: Props['type'];
    fallback?: ReactNode;
    componentName?: string;
  }
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary
      type={options?.type}
      fallback={options?.fallback}
      componentName={options?.componentName || Component.displayName || Component.name}
    >
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;

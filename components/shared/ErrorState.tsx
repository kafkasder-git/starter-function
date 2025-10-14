/**
 * @fileoverview ErrorState Component - Hata durumları için UI component
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Mail, 
  Phone,
  Wifi,
  Database,
  Server
} from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
  onContactSupport?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'network' | 'server' | 'database' | 'generic' | 'notFound';
  showDetails?: boolean;
}

/**
 * Error state component for showing error messages and recovery options
 * Farklı hata türleri için özelleştirilmiş mesajlar ve çözüm önerileri
 */
const ErrorStateComponent = memo(function ErrorState({
  title,
  message,
  error,
  onRetry,
  onGoHome,
  onContactSupport,
  className,
  size = 'md',
  type = 'generic',
  showDetails = false
}: ErrorStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const iconSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  };

  // Error type configurations
  const errorConfigs = {
    network: {
      icon: <Wifi className="w-16 h-16" />,
      defaultTitle: 'Bağlantı Hatası',
      defaultMessage: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
      suggestions: [
        'İnternet bağlantınızı kontrol edin',
        'Wi-Fi veya mobil veri bağlantısını yeniden başlatın',
        'Birkaç dakika sonra tekrar deneyin'
      ]
    },
    server: {
      icon: <Server className="w-16 h-16" />,
      defaultTitle: 'Sunucu Hatası',
      defaultMessage: 'Sunucu geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      suggestions: [
        'Birkaç dakika sonra tekrar deneyin',
        'Sayfayı yenileyin',
        'Sorun devam ederse teknik destek ile iletişime geçin'
      ]
    },
    database: {
      icon: <Database className="w-16 h-16" />,
      defaultTitle: 'Veri Tabanı Hatası',
      defaultMessage: 'Veri tabanı bağlantısında sorun yaşanıyor.',
      suggestions: [
        'Sayfayı yenileyin',
        'Farklı bir tarayıcı deneyin',
        'Sorun devam ederse sistem yöneticisi ile iletişime geçin'
      ]
    },
    notFound: {
      icon: <AlertTriangle className="w-16 h-16" />,
      defaultTitle: 'Sayfa Bulunamadı',
      defaultMessage: 'Aradığınız sayfa mevcut değil veya taşınmış olabilir.',
      suggestions: [
        'URL adresini kontrol edin',
        'Ana sayfaya dönün',
        'Arama fonksiyonunu kullanın'
      ]
    },
    generic: {
      icon: <AlertTriangle className="w-16 h-16" />,
      defaultTitle: 'Bir Hata Oluştu',
      defaultMessage: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
      suggestions: [
        'Sayfayı yenileyin',
        'Tarayıcı önbelleğini temizleyin',
        'Sorun devam ederse teknik destek ile iletişime geçin'
      ]
    }
  };

  const config = errorConfigs[type];
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <Card className={cn('max-w-2xl mx-auto', className)}>
      <CardHeader className="text-center">
        <div className={cn('text-red-500 mb-4 mx-auto', iconSizes[size])}>
          {config.icon}
        </div>
        <CardTitle className={cn(
          'text-red-900',
          size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'
        )}>
          {displayTitle}
        </CardTitle>
        <CardDescription className={cn(
          'text-gray-600',
          size === 'sm' ? 'text-sm' : 'text-base'
        )}>
          {displayMessage}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Suggestions */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Öneriler:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {config.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>

        {/* Error Details (Development only) */}
        {showDetails && error && process.env.NODE_ENV === 'development' && (
          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Teknik Detaylar (Geliştirme Modu)
            </summary>
            <pre className="text-xs text-gray-600 overflow-auto">
              {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              className="min-w-[120px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tekrar Dene
            </Button>
          )}

          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              className="min-w-[120px]"
            >
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          )}

          {onContactSupport && (
            <Button
              onClick={onContactSupport}
              variant="secondary"
              className="min-w-[120px]"
            >
              <Mail className="w-4 h-4 mr-2" />
              Destek
            </Button>
          )}
        </div>

        {/* Contact Information */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>Sorun devam ederse bizimle iletişime geçin:</p>
          <div className="flex justify-center items-center gap-4 mt-2">
            <a 
              href="mailto:destek@dernekys.com" 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Mail className="w-4 h-4" />
              destek@dernekys.com
            </a>
            <a 
              href="tel:+905551234567" 
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Phone className="w-4 h-4" />
              0555 123 45 67
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Predefined error states for common scenarios
export const ErrorStates = {
  NetworkError: memo(function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
      <ErrorStateComponent
        type="network"
        onRetry={onRetry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }),

  ServerError: memo(function ServerErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
      <ErrorStateComponent
        type="server"
        onRetry={onRetry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }),

  DatabaseError: memo(function DatabaseErrorState({ onRetry }: { onRetry?: () => void }) {
    return (
      <ErrorStateComponent
        type="database"
        onRetry={onRetry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }),

  NotFound: memo(function NotFoundErrorState({ onGoHome }: { onGoHome?: () => void }) {
    return (
      <ErrorStateComponent
        type="notFound"
        onGoHome={onGoHome}
      />
    );
  }),

  GenericError: memo(function GenericErrorState({ 
    error, 
    onRetry 
  }: { 
    error?: Error | string;
    onRetry?: () => void;
  }) {
    return (
      <ErrorStateComponent
        type="generic"
        error={error}
        onRetry={onRetry}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  })
};

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; onRetry?: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ErrorStates.GenericError;
      
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <FallbackComponent 
            error={this.state.error}
            onRetry={() => this.setState({ hasError: false, error: undefined })}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorStateComponent;

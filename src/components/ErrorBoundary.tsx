import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '../../lib/logging/logger';

interface Props {
  children: ReactNode;
  type?: 'app' | 'component' | 'network';
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      logger.error('ErrorBoundary caught an error', { error, errorInfo });
    }
  }

  // Error configuration helper
  private getErrorConfig(type: string) {
    const configs = {
      network: {
        title: 'Bağlantı Hatası',
        message: 'Ağ bağlantısında bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin.',
        buttonText: 'Sayfayı Yenile',
        buttonAction: () => window.location.reload(),
        buttonClass: 'bg-blue-600 hover:bg-blue-700'
      },
      component: {
        title: 'Bileşen Hatası',
        message: 'Bu bileşende bir hata oluştu. Lütfen sayfayı yenileyin.',
        buttonText: 'Yenile',
        buttonAction: () => window.location.reload(),
        buttonClass: 'bg-yellow-600 hover:bg-yellow-700'
      },
      app: {
        title: 'Beklenmeyen Hata',
        message: 'Uygulamada beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.',
        buttonText: 'Sayfayı Yenile',
        buttonAction: () => window.location.reload(),
        buttonClass: 'bg-red-600 hover:bg-red-700'
      }
    };
    return configs[type as keyof typeof configs] || configs.app;
  }

  // Reusable error UI renderer
  private renderErrorUI(config: any) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">{config.title}</h3>
            <p className="mb-4 text-sm text-gray-500">{config.message}</p>
            <button
              onClick={config.buttonAction}
              className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonClass}`}
            >
              {config.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on type
      const errorConfig = this.getErrorConfig(this.props.type ?? 'app');
      return this.renderErrorUI(errorConfig);
    }

    return this.props.children;
  }
}
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

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on type
      switch (this.props.type ?? 'app') {
        case 'network':
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
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Bağlantı Hatası
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Ağ bağlantısında bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin.
                  </p>
                  <button
                    onClick={() => {
                      window.location.reload();
                    }}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Sayfayı Yenile
                  </button>
                </div>
              </div>
            </div>
          );

        case 'component':
          return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Bileşen Hatası
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Bu bileşende bir hata oluştu. Lütfen sayfayı yenileyin.</p>
                  </div>
                </div>
              </div>
            </div>
          );

        case 'app':
        default:
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
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Beklenmeyen Hata
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Uygulamada beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        window.location.reload();
                      }}
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Sayfayı Yenile
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                      <details className="mt-4 text-left">
                        <summary className="cursor-pointer text-sm text-gray-600">
                          Hata Detayları (Geliştirici)
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                          {this.state.error.toString()}
                          {this.state.errorInfo?.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
      }
    }

    return this.props.children;
  }
}

/**
 * @fileoverview StoreErrorBoundary Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { Component, type ReactNode } from 'react';
import { logger } from '../lib/logging/logger';
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * StoreErrorBoundary Service
 *
 * Service class for handling storeerrorboundary operations
 *
 * @class StoreErrorBoundary
 */
export class StoreErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Store initialization error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for store initialization errors
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-lg">
            <div className="text-lg font-medium text-red-600">Sistem Başlatılamadı</div>
            <div className="max-w-md text-center text-sm text-gray-600">
              Uygulama başlatılırken bir hata oluştu. Sayfayı yenilemeyi deneyin.
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

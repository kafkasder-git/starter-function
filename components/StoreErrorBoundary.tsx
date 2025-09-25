/**
 * @fileoverview StoreErrorBoundary Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import React, { Component } from 'react';

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
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
          <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg">
            <div className="text-red-600 text-lg font-medium">Sistem Başlatılamadı</div>
            <div className="text-gray-600 text-sm text-center max-w-md">
              Uygulama başlatılırken bir hata oluştu. Sayfayı yenilemeyi deneyin.
            </div>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

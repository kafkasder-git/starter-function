import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App';
import './index.css';
import { logger } from '../lib/logging/logger';

// Create a client with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache data for 10 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for real-time data
      refetchOnWindowFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data exists and is fresh
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Global error handlers for production
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Log error to console
    logger.error('Unhandled promise rejection:', event.reason);

    // Show user-friendly error message
    const errorContainer = document.getElementById('global-error-container');
    if (!errorContainer) {
      const div = document.createElement('div');
      div.id = 'global-error-container';
      div.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #fee;
        border: 1px solid #fcc;
        color: #800;
        padding: 10px;
        text-align: center;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      div.textContent = '⚠️ Bir bağlantı hatası oluştu. Sayfa yenileniyor...';
      document.body.appendChild(div);

      // Auto refresh after 3 seconds
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }

    // Prevent the default browser error handling
    event.preventDefault();
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    // Log error to console
    logger.error('Global error:', event.error);

    // Don't reload on script loading errors
    if (event.filename?.includes('chunk')) {
      logger.warn('Chunk loading error detected, attempting reload...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

try {
  // Initialize React App
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* React Query DevTools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
            buttonPosition="bottom-left"
          />
        )}
      </QueryClientProvider>
    </React.StrictMode>
  );
} catch (error) {
  // Log error using logger
  logger.error('Failed to initialize app:', error);

  // Fallback UI for critical errors
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      ">
        <div style="
          background: white;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 500px;
        ">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h1 style="color: #1f2937; margin-bottom: 16px; font-size: 24px; font-weight: 600;">
            Uygulama Başlatılamadı
          </h1>
          <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
            Teknik bir sorun nedeniyle uygulama şu anda başlatılamıyor.
            Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
          </p>
          <button
            onclick="window.location.reload()"
            style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 16px;
              cursor: pointer;
              margin: 8px;
            "
          >
            🔄 Sayfayı Yenile
          </button>
          <details style="margin-top: 20px; text-align: left; font-size: 14px;">
            <summary style="cursor: pointer;">Teknik Detaylar</summary>
            <pre style="
              background: #f8f9fa;
              padding: 10px;
              border-radius: 4px;
              overflow: auto;
              margin-top: 8px;
              font-size: 12px;
            ">${error instanceof Error ? error.message : String(error)}</pre>
          </details>
        </div>
      </div>
    `;
  }
}

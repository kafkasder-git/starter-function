import React from 'react';
import ReactDOM from 'react-dom/client';
import { inject } from '@vercel/analytics';
import App from './App';
import './index.css';
import './styles/globals.css';

// Global error handlers for production
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
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
      div.innerHTML = '⚠️ Bir bağlantı hatası oluştu. Sayfa yenileniyor...';
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
    console.error('Global error:', event.error);
    
    // Don't reload on script loading errors
    if (event.filename && event.filename.includes('chunk')) {
      console.warn('Chunk loading error detected, attempting reload...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}

try {
  // Initialize React App
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );

  // Initialize Vercel Analytics
  inject();
} catch (error) {
  console.error('Failed to initialize app:', error);
  
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

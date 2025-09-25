import React from 'react';
import ReactDOM from 'react-dom/client';
import { inject } from '@vercel/analytics';
import App from './App';
import './index.css';
import './styles/globals.css';

// Remove loading indicator
const removeLoader = () => {
  const loader = document.getElementById('app-loading');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 300);
  }
  // Also remove any other loading elements that might exist
  const loadingElements = document.querySelectorAll('[data-loading="true"], .loading-overlay');
  loadingElements.forEach((el) => {
    el.remove();
  });
};

// Initialize React App
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Initialize Vercel Analytics manually
inject();

// Clean up loading state
removeLoader();

// Development hot reload support
if (import.meta.hot) {
  import.meta.hot.accept();
}

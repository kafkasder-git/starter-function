/**
 * @fileoverview EnvironmentUtils Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';

// Environment detection utilities
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isTest = import.meta.env.MODE === 'test';

// Development-only component wrapper
interface DevOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const DevOnly = ({ children, fallback = null }: DevOnlyProps) => {
  if (!isDevelopment) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

// Production-only component wrapper
export const ProdOnly = ({ children, fallback = null }: DevOnlyProps) => {
  if (!isProduction) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};

// Conditional component loading
export const ConditionalComponent = ({
  condition,
  children,
  fallback = null,
}: {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  return condition ? <>{children}</> : <>{fallback}</>;
};

// Environment-specific configuration
export const getEnvironmentConfig = () => ({
  isDevelopment,
  isProduction,
  isTest,
  showDebugInfo: isDevelopment,
  enableAnalytics: isProduction,
  enableErrorReporting: isProduction,
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

// Bundle size optimization - tree shaking helper
export const removeInProduction = (component: React.ComponentType) => {
  if (isProduction) {
    return () => null;
  }
  return component;
};

// Development tools
export const DevTools = removeInProduction(() => (
  <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
    <div>Mode: {import.meta.env.MODE}</div>
    <div>Bundle: {isProduction ? 'Optimized' : 'Development'}</div>
    <div>
      Memory: {Math.round((performance as any).memory?.usedJSHeapSize / 1024 / 1024 ?? 0)}MB
    </div>
  </div>
));

// Performance warning for large components
export const LargeComponentWarning = ({ componentName }: { componentName: string }) => {
  if (!isDevelopment) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
      <strong>Performance Warning:</strong> {componentName} is a large component. Consider lazy
      loading or code splitting.
    </div>
  );
};

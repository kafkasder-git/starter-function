/**
 * @fileoverview AppInitializer Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { usePerformanceOptimization } from '../../hooks/usePerformanceOptimization';
import { PageLoading } from '../LoadingSpinner';

import { logger } from '../lib/logging/logger';
interface AppInitializerProps {
  children: React.ReactNode;
  onInitialized?: () => void;
}

/**
 * App Initializer - Handles application startup and initialization
 */
/**
 * AppInitializer function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AppInitializer({ children, onInitialized }: AppInitializerProps) {
  const { requestFrame } = usePerformanceOptimization();
  const [initializationComplete, setInitializationComplete] = useState(true);
  const [initializationError, setInitializationError] = useState<Error | null>(null);

  // App initialization process
  const initializeApp = useCallback(async () => {
    try {
      setInitializationError(null);

      // Check if we have basic localStorage support
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
        } catch (e) {
          throw new Error('LocalStorage not available');
        }
      }

      // Minimal initialization process
      await new Promise((resolve) => setTimeout(resolve, 50)); // Further reduced

      // Single frame for immediate completion
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(undefined);
        });
      });

      setInitializationComplete(true);
    } catch (error) {
      logger.error('Initialization failed:', error);
      setInitializationError(error instanceof Error ? error : new Error('Initialization failed'));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;

    initializeApp().finally(() => {
      if (!mounted) return;
      // Ensure initialization completes even if there are errors
      if (!initializationComplete && !initializationError) {
        setTimeout(() => {
          if (mounted) {
            setInitializationComplete(true);
            onInitialized?.();
          }
        }, 200);
      }
    });

    return () => {
      mounted = false;
    };
  }, [initializeApp, initializationComplete, initializationError, onInitialized]);

  // Error recovery
  const handleRetryInitialization = useCallback(() => {
    setInitializationError(null);
    setInitializationComplete(false);
    initializeApp();
  }, [initializeApp]);

  // Loading screen
  if (!initializationComplete) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-4">
            <PageLoading />
            <div className="text-sm text-slate-600 dark:text-slate-300 animate-pulse">
              Dernek Yönetim Sistemi başlatılıyor...
            </div>
            {initializationError && (
              <div className="text-xs text-red-600 dark:text-red-400 text-center max-w-md">
                <p className="mb-2">Başlatma sırasında bir sorun oluştu:</p>
                <p className="text-xs opacity-75 mb-3">{initializationError.message}</p>
                <button
                  onClick={handleRetryInitialization}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors"
                >
                  Tekrar Dene
                </button>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-1">
            <span>v1.0 - Frontend Application</span>
            <span className="text-xs opacity-60">Desktop Admin Panel</span>
          </div>
        </div>
      </div>
    );
  }

  // Return children when initialization is complete
  return <>{children}</>;
}

export default AppInitializer;

/**
 * @fileoverview SafeWrapper Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';

import { logger } from '../lib/logging/logger';
interface SafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface SafeWrapperState {
  hasError: boolean;
  error?: Error;
}

/**
 * SafeWrapper Service
 * 
 * Service class for handling safewrapper operations
 * 
 * @class SafeWrapper
 */
export class SafeWrapper extends React.Component<SafeWrapperProps, SafeWrapperState> {
  constructor(props: SafeWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeWrapperState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(
      `SafeWrapper caught error in ${this.props.componentName ?? 'Unknown Component'}:`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-medium">Bileşen Yükleme Hatası</h3>
            <p className="text-red-600 text-sm mt-1">
              {this.props.componentName} bileşeni yüklenirken bir hata oluştu.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
              }}
              className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
            >
              Tekrar Dene
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Higher-order component for safer component rendering
/**
 * withSafeWrapper function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function withSafeWrapper<P extends Record<string, any> = {}>(
  Component: React.ComponentType<P>,
  componentName?: string,
) {
  const WrappedComponent = React.forwardRef<React.ComponentRef<typeof Component>, P>(
    (props, ref) => (
      <SafeWrapper componentName={componentName ?? Component.name}>
        <Component {...(props as any)} ref={ref} />
      </SafeWrapper>
    ),
  );

  WrappedComponent.displayName = `withSafeWrapper(${Component.name ?? 'Component'})`;

  return WrappedComponent;
}

// Hook for safe component rendering
/**
 * useSafeRender function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useSafeRender() {
  return {
    renderSafely: (component: React.ReactNode, fallback?: React.ReactNode) => (
      <SafeWrapper fallback={fallback}>{component}</SafeWrapper>
    ),
  };
}

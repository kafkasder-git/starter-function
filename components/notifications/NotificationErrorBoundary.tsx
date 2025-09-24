import type { ReactNode } from 'react';
import React, { Component } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class NotificationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Notification component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Default fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Minimal fallback for notification components
      return <div className="text-xs text-gray-500 p-2">Bildirimler yüklenemiyor</div>;
    }

    return this.props.children;
  }
}

/**
 * @fileoverview PageLayout Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
}

/**
 * PageLayout function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PageLayout({
  title,
  subtitle,
  children,
  showBackButton = false,
  onBack,
  actions,
  className,
}: PageLayoutProps & { className?: string }) {
  return (
    <div className={`flex flex-col h-full ${className ?? ''}`}>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-30 relative">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="min-h-[44px] flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="min-w-0">
                <h1 className="text-2xl font-medium text-gray-900 truncate">{title}</h1>
                {subtitle && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{subtitle}</p>}
              </div>
            </div>

            {/* Actions Container - Important: this renders the actions */}
            {actions && <div className="flex-shrink-0 w-full sm:w-auto">{actions}</div>}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto bg-gray-50">{children}</div>
    </div>
  );
}

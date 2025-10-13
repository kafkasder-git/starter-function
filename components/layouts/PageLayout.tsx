/**
 * @fileoverview PageLayout Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Heading } from '../ui/heading';
import { Text } from '../ui/text';
import { SkipLinks } from '../ui/SkipLinks';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: ReactNode;
}

/**
 * PageLayout Component
 *
 * Provides consistent page structure with header, title, and content area.
 *
 * Heading Hierarchy:
 * - PageLayout renders the page H1 (title prop)
 * - Page sections should use H2 (Heading level={2})
 * - Subsections should use H3 (Heading level={3})
 * - Card titles typically use H4 (Heading level={4})
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
    <>
      <SkipLinks />
      <div className={`flex flex-col h-full ${className ?? ''}`}>
        {/* Page Header */}
        <header className="bg-white border-b border-neutral-200 shadow-sm z-30 relative">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {showBackButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBack}
                    className="min-h-[44px] flex-shrink-0"
                    aria-label="Go back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="min-w-0 flex-1">
                  <Heading
                    level={1}
                    size="2xl"
                    weight="medium"
                    className="line-clamp-2 break-words"
                  >
                    {title}
                  </Heading>
                  {subtitle && (
                    <Text size="sm" color="neutral" className="mt-1 line-clamp-2 break-words">
                      {subtitle}
                    </Text>
                  )}
                </div>
              </div>

              {/* Actions Container - Important: this renders the actions */}
              {actions && <div className="flex-shrink-0 w-full sm:w-auto">{actions}</div>}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main" tabIndex={-1} className="flex-1 overflow-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </>
  );
}

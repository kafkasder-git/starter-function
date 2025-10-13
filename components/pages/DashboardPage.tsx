/**
 * @fileoverview DashboardPage - Main dashboard page
 * @description Central dashboard with overview and quick actions
 * @version 1.0.0
 */

import React, { useCallback } from 'react';
import { EnhancedDashboard } from '../ui/EnhancedDashboard';
import { useNavigation } from '../app/RouterNavigationManager';

interface DashboardPageProps {
  onNavigate?: (moduleId: string, page?: string) => void;
  onQuickAction?: (actionId: string) => void;
}

/**
 * DashboardPage Component
 * Main landing page with overview statistics and quick actions
 */
export function DashboardPage({ onNavigate, onQuickAction }: DashboardPageProps) {
  const { moduleChange, subPageChange } = useNavigation();

  const handleNavigate = useCallback(
    (moduleId: string, page?: string) => {
      if (onNavigate) {
        onNavigate(moduleId, page);
        return;
      }

      if (!moduleId) {
        return;
      }

      moduleChange(moduleId);

      if (page) {
        const normalizedPage = page.startsWith('/') ? page : `/${page}`;
        subPageChange(normalizedPage);
      }
    },
    [moduleChange, subPageChange, onNavigate]
  );

  const handleQuickAction = useCallback(
    (actionId: string) => {
      if (onQuickAction) {
        onQuickAction(actionId);
        return;
      }

      const actionMap: Record<string, { module: string; subPage?: string }> = {
        'new-beneficiary': { module: 'yardim', subPage: '/yardim/ihtiyac-sahipleri' },
        'new-aid-application': { module: 'yardim', subPage: '/yardim/basvurular' },
        'new-donation': { module: 'bagis', subPage: '/bagis/liste' },
        'record-donation': { module: 'bagis', subPage: '/bagis/liste' },
        'new-member': { module: 'uye', subPage: '/uye/yeni' },
        'expense-entry': { module: 'fon', subPage: '/fon/gelir-gider' },
      };

      const action = actionMap[actionId];
      if (!action) {
        return;
      }

      moduleChange(action.module);

      if (action.subPage) {
        subPageChange(action.subPage);
      }
    },
    [moduleChange, onQuickAction, subPageChange]
  );

  return <EnhancedDashboard onNavigate={handleNavigate} onQuickAction={handleQuickAction} />;
}

export default DashboardPage;

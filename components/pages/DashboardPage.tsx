/**
 * @fileoverview DashboardPage - Main dashboard page
 * @description Central dashboard with overview and quick actions
 * @version 1.0.0
 */

import React from 'react';
import { EnhancedDashboard } from '../ui/EnhancedDashboard';

interface DashboardPageProps {
  onNavigate?: (moduleId: string) => void;
  onQuickAction?: (actionId: string) => void;
}

/**
 * DashboardPage Component
 * Main landing page with overview statistics and quick actions
 */
export function DashboardPage({ onNavigate, onQuickAction }: DashboardPageProps) {
  return <EnhancedDashboard onNavigate={onNavigate} onQuickAction={onQuickAction} />;
}

export default DashboardPage;
/**
 * @fileoverview AppNavigation Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';

// Lazy loaded page components with better organization
export const createLazyComponent = (
  importFn: () => Promise<{ default: any }>,
  displayName: string,
) => {
  const Component = React.lazy(importFn);
  (Component as any).displayName = displayName;
  return Component;
};

// Dashboard removed - using EnhancedDashboard

// AI Assistant removed

// Aid Management (Yardım) Module - Enhanced version
export const BeneficiariesPage = createLazyComponent(
  () =>
    import('../pages/BeneficiariesPageEnhanced').then((m) => ({
      default: m.BeneficiariesPageEnhanced,
    })),
  'BeneficiariesPage',
);

export const BeneficiaryDetailPageComprehensive = createLazyComponent(
  () =>
    import('../pages/BeneficiaryDetailPageComprehensive').then((m) => ({
      default: m.BeneficiaryDetailPageComprehensive,
    })),
  'BeneficiaryDetailPageComprehensive',
);

export const AidApplicationsPage = createLazyComponent(
  () => import('../pages/AidApplicationsPage').then((m) => ({ default: m.AidApplicationsPage })),
  'AidApplicationsPage',
);

export const AllAidListPage = createLazyComponent(
  () => import('../pages/AllAidListPage').then((m) => ({ default: m.AllAidListPage })),
  'AllAidListPage',
);

export const CashAidVaultPage = createLazyComponent(
  () => import('../pages/CashAidVaultPage').then((m) => ({ default: m.CashAidVaultPage })),
  'CashAidVaultPage',
);

export const BankPaymentOrdersPage = createLazyComponent(
  () =>
    import('../pages/BankPaymentOrdersPage').then((m) => ({ default: m.BankPaymentOrdersPage })),
  'BankPaymentOrdersPage',
);

export const CashAidTransactionsPage = createLazyComponent(
  () =>
    import('../pages/CashAidTransactionsPage').then((m) => ({
      default: m.CashAidTransactionsPage,
    })),
  'CashAidTransactionsPage',
);

export const InKindAidTransactionsPage = createLazyComponent(
  () =>
    import('../pages/InKindAidTransactionsPage').then((m) => ({
      default: m.InKindAidTransactionsPage,
    })),
  'InKindAidTransactionsPage',
);

export const ServiceTrackingPage = createLazyComponent(
  () => import('../pages/ServiceTrackingPage').then((m) => ({ default: m.ServiceTrackingPage })),
  'ServiceTrackingPage',
);

export const HospitalReferralPage = createLazyComponent(
  () => import('../pages/HospitalReferralPage').then((m) => ({ default: m.HospitalReferralPage })),
  'HospitalReferralPage',
);

export const ApplicationWorkflowPage = createLazyComponent(
  () => import('../pages/ApplicationWorkflowPage'),
  'ApplicationWorkflowPage',
);

export const DocumentManagementPage = createLazyComponent(
  () => import('../pages/DocumentManagementPage'),
  'DocumentManagementPage',
);

export const InventoryManagementPage = createLazyComponent(
  () => import('../pages/InventoryManagementPage'),
  'InventoryManagementPage',
);

export const AppointmentSchedulingPage = createLazyComponent(
  () => import('../pages/AppointmentSchedulingPage'),
  'AppointmentSchedulingPage',
);

export const CaseManagementPage = createLazyComponent(
  () => import('../pages/CaseManagementPage'),
  'CaseManagementPage',
);

export const DistributionTrackingPage = createLazyComponent(
  () => import('../pages/DistributionTrackingPage'),
  'DistributionTrackingPage',
);

// Donations (Bağış) Module
export const DonationsPage = createLazyComponent(
  () => import('../pages/DonationsPage').then((m) => ({ default: m.DonationsPage })),
  'DonationsPage',
);

export const KumbaraPage = createLazyComponent(
  () => import('../pages/KumbaraPage').then((m) => ({ default: m.KumbaraPage })),
  'KumbaraPage',
);

// DonationReportsPage removed

// Members (Üye) Module
export const MembersPage = createLazyComponent(
  () => import('../pages/MembersPage').then((m) => ({ default: m.MembersPage })),
  'MembersPage',
);

export const MembershipFeesPage = createLazyComponent(
  () => import('../pages/MembershipFeesPage').then((m) => ({ default: m.MembershipFeesPage })),
  'MembershipFeesPage',
);

export const NewMemberPage = createLazyComponent(
  () => import('../pages/NewMemberPage').then((m) => ({ default: m.NewMemberPage })),
  'NewMemberPage',
);

// Scholarship (Burs) Module
export const BursStudentsPage = createLazyComponent(
  () => import('../pages/BursStudentsPage').then((m) => ({ default: m.BursStudentsPage })),
  'BursStudentsPage',
);

export const BursApplicationsPage = createLazyComponent(
  () => import('../pages/BursApplicationsPage').then((m) => ({ default: m.BursApplicationsPage })),
  'BursApplicationsPage',
);

// Finance (Fon) Module
export const FinanceIncomePage = createLazyComponent(
  () => import('../pages/FinanceIncomePage').then((m) => ({ default: m.FinanceIncomePage })),
  'FinanceIncomePage',
);

// FinanceReportsPage removed

// Communication (Mesaj) Module

export const InternalMessagingPage = createLazyComponent(
  () =>
    import('../pages/InternalMessagingPage').then((m) => ({ default: m.InternalMessagingPage })),
  'InternalMessagingPage',
);

// Work/Events (İş) Module
export const EventsPage = createLazyComponent(
  () => import('../pages/EventsPage').then((m) => ({ default: m.EventsPage })),
  'EventsPage',
);

// MeetingsPage removed
// TasksPage removed

// Partners Module
// Partner pages removed

// Legal (Hukuki) Module
export const LegalConsultationPage = createLazyComponent(
  () =>
    import('../pages/LegalConsultationPage').then((m) => ({
      default: m.LegalConsultationPage ?? m.default,
    })),
  'LegalConsultationPage',
);

export const LawyerAssignmentsPage = createLazyComponent(
  () =>
    import('../pages/LawyerAssignmentsPage').then((m) => ({
      default: m.LawyerAssignmentsPage ?? m.default,
    })),
  'LawyerAssignmentsPage',
);

export const LawsuitTrackingPage = createLazyComponent(
  () =>
    import('../pages/LawsuitTrackingPage').then((m) => ({
      default: m.LawsuitTrackingPage ?? m.default,
    })),
  'LawsuitTrackingPage',
);

export const LegalDocumentsPage = createLazyComponent(
  () =>
    import('../pages/LegalDocumentsPage').then((m) => ({
      default: m.LegalDocumentsPage ?? m.default,
    })),
  'LegalDocumentsPage',
);

// LegalReportsPage removed


// System Management Module
export const ProfilePage = createLazyComponent(
  () => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
  'ProfilePage',
);

export const SystemSettingsPage = createLazyComponent(
  () => import('../pages/SystemSettingsPage').then((m) => ({ default: m.SystemSettingsPage })),
  'SystemSettingsPage',
);

export const UserManagementPage = createLazyComponent(
  () =>
    import('../pages/UserManagementPageReal').then((m) => ({ default: m.UserManagementPageReal })),
  'UserManagementPage',
);

// Data Management

// Demo components removed

// Enhanced Dashboard
export const EnhancedDashboard = createLazyComponent(
  () => import('../ui/EnhancedDashboard'),
  'EnhancedDashboard',
);

// Reporting & Analytics Module - Removed (components deleted)

/**
 * Navigation Configuration
 */
/**
 * RouteConfig Interface
 * 
 * @interface RouteConfig
 */
export interface RouteConfig {
  component: React.LazyExoticComponent<any>;
  props?: Record<string, any>;
  skeletonVariant?: 'detail' | 'table' | 'form' | 'dashboard';
}

/**
 * Route Registry - Centralized route management
 */
export const ROUTE_REGISTRY: Record<string, Record<string, RouteConfig>> = {
  // AI Assistant Module removed

  // Aid Management Module
  yardim: {
    '/yardim/ihtiyac-sahipleri': {
      component: BeneficiariesPage,
      skeletonVariant: 'table',
      props: {},
    },
    '/yardim/basvurular': {
      component: AidApplicationsPage,
      skeletonVariant: 'table',
    },
    '/yardim/liste': {
      component: AllAidListPage,
      skeletonVariant: 'table',
    },
    '/yardim/nakdi-vezne': {
      component: CashAidVaultPage,
      skeletonVariant: 'table',
    },
    '/yardim/banka-odeme': {
      component: BankPaymentOrdersPage,
      skeletonVariant: 'table',
    },
    '/yardim/nakdi-islemler': {
      component: CashAidTransactionsPage,
      skeletonVariant: 'table',
    },
    '/yardim/ayni-islemler': {
      component: InKindAidTransactionsPage,
      skeletonVariant: 'table',
    },
    '/yardim/hizmet-takip': {
      component: ServiceTrackingPage,
      skeletonVariant: 'table',
    },
    '/yardim/hastane-sevk': {
      component: HospitalReferralPage,
      skeletonVariant: 'form',
    },
    '/yardim/surecler': {
      component: ApplicationWorkflowPage,
      skeletonVariant: 'dashboard',
    },
    '/yardim/belgeler': {
      component: DocumentManagementPage,
      skeletonVariant: 'table',
    },
    '/yardim/envanter': {
      component: InventoryManagementPage,
      skeletonVariant: 'table',
    },
    '/yardim/randevular': {
      component: AppointmentSchedulingPage,
      skeletonVariant: 'table',
    },
    '/yardim/vaka-yonetimi': {
      component: CaseManagementPage,
      skeletonVariant: 'dashboard',
    },
    '/yardim/dagitim-takip': {
      component: DistributionTrackingPage,
      skeletonVariant: 'table',
    },
    default: {
      component: BeneficiariesPage,
      skeletonVariant: 'table',
      props: {},
    },
  },

  // Other modules
  genel: {
    default: {
      component: EnhancedDashboard,
      skeletonVariant: 'dashboard',
      props: {},
    },
  },

  bagis: {
    '/bagis/kumbara': { component: KumbaraPage, skeletonVariant: 'dashboard' },
    default: { component: DonationsPage, skeletonVariant: 'table' },
  },

  uye: {
    '/uye/aidat': { component: MembershipFeesPage, skeletonVariant: 'table' },
    '/uye/yeni': { component: NewMemberPage, skeletonVariant: 'form' },
    default: { component: MembersPage, skeletonVariant: 'table' },
  },

  burs: {
    '/burs/ogrenciler': { component: BursStudentsPage, skeletonVariant: 'table' },
    '/burs/basvurular': { component: BursApplicationsPage, skeletonVariant: 'table' },
    default: { component: BursStudentsPage, skeletonVariant: 'table' },
  },

  fon: {
    '/fon/gelir-gider': { component: FinanceIncomePage, skeletonVariant: 'dashboard' },
    default: { component: FinanceIncomePage, skeletonVariant: 'dashboard' },
  },

  mesaj: {
    '/mesaj/kurum-ici': { component: InternalMessagingPage, skeletonVariant: 'dashboard' },
    default: { component: InternalMessagingPage, skeletonVariant: 'dashboard' },
  },

  is: {
    '/is/etkinlikler': { component: EventsPage, skeletonVariant: 'table' },
    default: { component: EventsPage, skeletonVariant: 'table' },
  },

  // Partner module removed

  hukuki: {
    '/hukuki/danismanlik': { component: LegalConsultationPage, skeletonVariant: 'dashboard' },
    '/hukuki/avukatlar': { component: LawyerAssignmentsPage, skeletonVariant: 'table' },
    '/hukuki/davalar': { component: LawsuitTrackingPage, skeletonVariant: 'table' },
    '/hukuki/belgeler': { component: LegalDocumentsPage, skeletonVariant: 'table' },
    default: { component: LegalConsultationPage, skeletonVariant: 'dashboard' },
  },

  // Reporting & Analytics Module - Removed (components deleted)

  // System pages
  profile: {
    default: { component: ProfilePage, skeletonVariant: 'detail' },
  },

  settings: {
    default: { component: SystemSettingsPage, skeletonVariant: 'detail' },
  },

  'user-management': {
    default: { component: UserManagementPage, skeletonVariant: 'table' },
  },


  // Demo routes removed
};

/**
 * Get route configuration for current navigation state
 */
/**
 * getRouteConfig function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getRouteConfig(activeModule: string, currentSubPage?: string): RouteConfig {
  const moduleRoutes = ROUTE_REGISTRY[activeModule];

  if (!moduleRoutes) {
    return {
      component: EnhancedDashboard,
      skeletonVariant: 'dashboard',
    };
  }

  // First try to find exact sub-page match
  if (currentSubPage && moduleRoutes[currentSubPage]) {
    return moduleRoutes[currentSubPage];
  }

  // Fallback to default for module
  if (moduleRoutes.default) {
    return moduleRoutes.default;
  }

  // Final fallback
  return {
    component: EnhancedDashboard,
    skeletonVariant: 'dashboard',
  };
}

export default {
  ROUTE_REGISTRY,
  getRouteConfig,
  createLazyComponent,
};

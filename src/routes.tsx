import type { RouteObject } from 'react-router-dom';

import DashboardPage from '../components/pages/DashboardPage';
import BeneficiariesPage from '../components/pages/BeneficiariesPageEnhanced';
import BeneficiaryDetailPage from '../components/pages/BeneficiaryDetailPageComprehensive';
import AidApplicationsPage from '../components/pages/AidApplicationsPage';
import AllAidListPage from '../components/pages/AllAidListPage';
import DonationsPage from '../components/pages/DonationsPage';
import ProfilePage from '../components/pages/ProfilePage';
import SystemSettingsPage from '../components/pages/SystemSettingsPage';
import UserManagementPage from '../components/pages/UserManagementPageReal';
import NotFoundPage from '../components/pages/NotFoundPage';
import LoginPage from '../components/auth/LoginPage';
import { UIComponentsShowcase } from '../components/pages/UIComponentsShowcase';
import { FormExamplesPage } from '../components/pages/FormExamplesPage';
import BursStudentsPage from '../components/pages/BursStudentsPage';
import BursApplicationsPage from '../components/pages/BursApplicationsPage';
import BulkMessagePage from '../components/pages/BulkMessagePage';
import { FinanceIncomePage } from '../components/pages/FinanceIncomePage';
import ApplicationWorkflowPage from '../components/pages/ApplicationWorkflowPage';
import LegalDocumentsPage from '../components/pages/LegalDocumentsPage';
import TasksPage from '../components/pages/TasksPage';
import MeetingsPage from '../components/pages/MeetingsPage';
import PartnersPage from '../components/pages/PartnersPage';

/**
 * Public routes configuration
 * Routes that do not require authentication
 */
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
];

/**
 * Protected routes configuration
 * Routes that require authentication (nested under root '/')
 */
export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Dashboard/General module
      {
        path: 'genel',
        element: <DashboardPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'genel/ui-showcase',
        element: <UIComponentsShowcase />,
      },
      {
        path: 'genel/form-examples',
        element: <FormExamplesPage />,
      },
      // Aid management module
      {
        path: 'yardim',
        element: <BeneficiariesPage />,
      },
      {
        path: 'yardim/ihtiyac-sahipleri',
        element: <BeneficiariesPage />,
      },
      {
        path: 'yardim/ihtiyac-sahipleri/:id',
        element: <BeneficiaryDetailPage />,
      },
      {
        path: 'yardim/basvurular',
        element: <AidApplicationsPage />,
      },
      {
        path: 'yardim/liste',
        element: <AllAidListPage />,
      },
      {
        path: 'yardim/ogrenci-listesi',
        element: <BursStudentsPage />,
      },
      // Donation module
      {
        path: 'bagis',
        element: <DonationsPage />,
      },
      {
        path: 'bagis/liste',
        element: <DonationsPage />,
      },
      // Burs (Scholarship) module
      {
        path: 'burs',
        element: <BursStudentsPage />,
      },
      {
        path: 'burs/ogrenciler',
        element: <BursStudentsPage />,
      },
      {
        path: 'burs/basvurular',
        element: <BursApplicationsPage />,
      },
      // Finance module
      {
        path: 'fon',
        element: <FinanceIncomePage />,
      },
      {
        path: 'fon/raporlar',
        element: <FinanceIncomePage />,
      },
      // Message module
      {
        path: 'mesaj',
        element: <BulkMessagePage />,
      },
      {
        path: 'mesaj/toplu',
        element: <BulkMessagePage />,
      },
      // Work module
      {
        path: 'is',
        element: <TasksPage />,
      },
      {
        path: 'is/etkinlikler',
        element: <TasksPage />,
      },
      {
        path: 'is/toplantilar',
        element: <MeetingsPage />,
      },
      {
        path: 'is/gorevlerim',
        element: <TasksPage />,
      },
      {
        path: 'is/gorevler',
        element: <TasksPage />,
      },
      // Legal module
      {
        path: 'hukuki',
        element: <LegalDocumentsPage />,
      },
      {
        path: 'hukuki/belgeler',
        element: <LegalDocumentsPage />,
      },
      // Partners module
      {
        path: 'partner',
        element: <PartnersPage />,
      },
      {
        path: 'partner/liste',
        element: <PartnersPage />,
      },
      {
        path: 'partner/bagiscilar',
        element: <ApplicationWorkflowPage />,
      },
      // User management
      {
        path: 'user-management',
        element: <UserManagementPage />,
      },
      // Profile
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Settings
      {
        path: 'settings',
        element: <SystemSettingsPage />,
      },
      // 404 - Catch all
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

/**
 * Combined application routes configuration
 * Uses React Router v6 for URL-based routing
 * Public routes are added directly, protected routes are nested under '/'
 */
export const routes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
];

/**
 * Module to route mapping
 * Maps old navigation module IDs to new route paths
 */
export const moduleToRoute: Record<string, string> = {
  genel: '/genel',
  yardim: '/yardim',
  bagis: '/bagis',
  uye: '/uye',
  fon: '/fon',
  etkinlik: '/etkinlik',
  iletisim: '/iletisim',
  profile: '/profile',
  settings: '/settings',
  'user-management': '/user-management',
};

/**
 * Route to module mapping
 * Maps route paths back to module IDs for backward compatibility
 */
export const routeToModule: Record<string, string> = Object.entries(moduleToRoute).reduce(
  (acc, [module, route]) => {
    return { ...acc, [route]: module };
  },
  {} as Record<string, string>,
);

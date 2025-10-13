import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('../components/pages/DashboardPage'));
const BeneficiariesPage = lazy(() => import('../components/pages/BeneficiariesPageEnhanced'));
const BeneficiaryDetailPage = lazy(() => import('../components/pages/BeneficiaryDetailPageComprehensive'));
const AidApplicationsPage = lazy(() => import('../components/pages/AidApplicationsPage'));
const AllAidListPage = lazy(() => import('../components/pages/AllAidListPage'));
const DonationsPage = lazy(() => import('../components/pages/DonationsPage'));
const ProfilePage = lazy(() => import('../components/pages/ProfilePage'));
const SystemSettingsPage = lazy(() => import('../components/pages/SystemSettingsPage'));
const UserManagementPage = lazy(() => import('../components/pages/UserManagementPageReal'));
const NotFoundPage = lazy(() => import('../components/pages/NotFoundPage'));
const LoginPage = lazy(() => import('../components/auth/LoginPage'));
const UIComponentsShowcase = lazy(() => import('../components/pages/UIComponentsShowcase'));
const FormExamplesPage = lazy(() => import('../components/pages/FormExamplesPage'));
const GanttExample = lazy(() => import('../components/examples/GanttExample'));
const KiboUIExample = lazy(() => import('../components/examples/KiboUIExample'));
const BursStudentsPage = lazy(() => import('../components/pages/BursStudentsPage'));
const BursApplicationsPage = lazy(() => import('../components/pages/BursApplicationsPage'));
const BulkMessagePage = lazy(() => import('../components/pages/BulkMessagePage'));
const FinanceIncomePage = lazy(() => import('../components/pages/FinanceIncomePage'));
const ApplicationWorkflowPage = lazy(() => import('../components/pages/ApplicationWorkflowPage'));
const LegalDocumentsPage = lazy(() => import('../components/pages/LegalDocumentsPage'));
const TasksPage = lazy(() => import('../components/pages/TasksPage'));
const MeetingsPage = lazy(() => import('../components/pages/MeetingsPage'));
const PartnersPage = lazy(() => import('../components/pages/PartnersPage'));

// Loading component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>
    {children}
  </Suspense>
);

/**
 * Public routes configuration
 * Routes that do not require authentication
 */
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <SuspenseWrapper><LoginPage /></SuspenseWrapper>,
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
      {
        path: 'genel/gantt',
        element: <GanttExample />,
      },
      {
        path: 'genel/kibo-ui',
        element: <KiboUIExample />,
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

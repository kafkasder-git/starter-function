import type { RouteObject } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('../components/pages/DashboardPage'));
const BeneficiariesPage = lazy(() => import('../components/pages/BeneficiariesPageEnhanced'));
const BeneficiaryDetailPage = lazy(
  () => import('../components/pages/BeneficiaryDetailPageComprehensive')
);
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
// const TestPagesMain = lazy(() => import('../components/pages/TestPages.tsx').then(m => ({ default: m.TestPagesMain })));
const BursStudentsPage = lazy(() => import('../components/pages/BursStudentsPage'));
const BursApplicationsPage = lazy(() => import('../components/pages/BursApplicationsPage'));
const OrphanListPage = lazy(() => import('../components/pages/OrphanListPage'));
const BulkMessagePage = lazy(() => import('../components/pages/BulkMessagePage'));
const InternalMessagingPage = lazy(() => import('../components/pages/InternalMessagingPage'));
const FinanceIncomePage = lazy(() => import('../components/pages/FinanceIncomePage'));
const ApplicationWorkflowPage = lazy(() => import('../components/pages/ApplicationWorkflowPage'));
const LegalDocumentsPage = lazy(() => import('../components/pages/LegalDocumentsPage'));
const TasksPage = lazy(() => import('../components/pages/TasksPage'));
const MeetingsPage = lazy(() => import('../components/pages/MeetingsPage'));
const PartnersPage = lazy(() => import('../components/pages/PartnersPage'));
const KumbaraPage = lazy(() => import('../components/pages/KumbaraPage'));
const CashAidVaultPage = lazy(() =>
  import('../components/pages/CashAidVaultPage').then((m) => ({ default: m.CashAidVaultPage }))
);
const DonationReportsPage = lazy(() =>
  import('../components/pages/DonationReportsPage').then((m) => ({
    default: m.DonationReportsPage,
  }))
);

// Import skeleton loaders
import { PageSkeleton } from '../components/ui/skeleton-loaders';

// Loading component - now context-aware
const PageLoading = () => <PageSkeleton />;

// Wrapper component for Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoading />}>{children}</Suspense>
);

/**
 * Public routes configuration
 * Routes that do not require authentication
 */
export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
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
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      // Dashboard/General module
      {
        path: 'genel',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <DashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'genel/ui-showcase',
        element: (
          <SuspenseWrapper>
            <UIComponentsShowcase />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'genel/form-examples',
        element: (
          <SuspenseWrapper>
            <FormExamplesPage />
          </SuspenseWrapper>
        ),
      },
      // {
      //   path: 'genel/test-pages',
      //   element: (
      //     <SuspenseWrapper>
      //       <TestPagesMain />
      //     </SuspenseWrapper>
      //   ),
      // },
      // Aid management module
      {
        path: 'yardim',
        element: (
          <SuspenseWrapper>
            <BeneficiariesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'yardim/ihtiyac-sahipleri',
        element: (
          <SuspenseWrapper>
            <BeneficiariesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'yardim/ihtiyac-sahipleri/:id',
        element: (
          <SuspenseWrapper>
            <BeneficiaryDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'yardim/basvurular',
        element: (
          <SuspenseWrapper>
            <AidApplicationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'yardim/liste',
        element: (
          <SuspenseWrapper>
            <AllAidListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'yardim/ogrenci-listesi',
        element: (
          <SuspenseWrapper>
            <BursStudentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'yardim/nakdi-vezne',
        element: (
          <SuspenseWrapper>
            <CashAidVaultPage />
          </SuspenseWrapper>
        ),
      },
      // Donation module
      {
        path: 'bagis',
        element: (
          <SuspenseWrapper>
            <DonationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'bagis/liste',
        element: (
          <SuspenseWrapper>
            <DonationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'bagis/kumbara',
        element: (
          <SuspenseWrapper>
            <KumbaraPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'bagis/raporlar',
        element: (
          <SuspenseWrapper>
            <DonationReportsPage />
          </SuspenseWrapper>
        ),
      },
      // Burs (Scholarship) module
      {
        path: 'burs',
        element: (
          <SuspenseWrapper>
            <BursStudentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'burs/ogrenciler',
        element: (
          <SuspenseWrapper>
            <BursStudentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'burs/basvurular',
        element: (
          <SuspenseWrapper>
            <BursApplicationsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'burs/yetim',
        element: (
          <SuspenseWrapper>
            <OrphanListPage />
          </SuspenseWrapper>
        ),
      },
      // Finance module
      {
        path: 'fon',
        element: (
          <SuspenseWrapper>
            <FinanceIncomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'fon/raporlar',
        element: (
          <SuspenseWrapper>
            <FinanceIncomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'fon/gelir-gider',
        element: (
          <SuspenseWrapper>
            <FinanceIncomePage />
          </SuspenseWrapper>
        ),
      },
      // Message module
      {
        path: 'mesaj',
        element: (
          <SuspenseWrapper>
            <InternalMessagingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'mesaj/kurum-ici',
        element: (
          <SuspenseWrapper>
            <InternalMessagingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'mesaj/icerik',
        element: (
          <SuspenseWrapper>
            <InternalMessagingPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'mesaj/toplu',
        element: (
          <SuspenseWrapper>
            <BulkMessagePage />
          </SuspenseWrapper>
        ),
      },
      // Work module
      {
        path: 'is',
        element: (
          <SuspenseWrapper>
            <TasksPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'is/etkinlikler',
        element: (
          <SuspenseWrapper>
            <TasksPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'is/toplantilar',
        element: (
          <SuspenseWrapper>
            <MeetingsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'is/gorevlerim',
        element: (
          <SuspenseWrapper>
            <TasksPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'is/gorevler',
        element: (
          <SuspenseWrapper>
            <TasksPage />
          </SuspenseWrapper>
        ),
      },
      // Legal module
      {
        path: 'hukuki',
        element: (
          <SuspenseWrapper>
            <LegalDocumentsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'hukuki/belgeler',
        element: (
          <SuspenseWrapper>
            <LegalDocumentsPage />
          </SuspenseWrapper>
        ),
      },
      // Partners module
      {
        path: 'partner',
        element: (
          <SuspenseWrapper>
            <PartnersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'partner/liste',
        element: (
          <SuspenseWrapper>
            <PartnersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'partner/bagiscilar',
        element: (
          <SuspenseWrapper>
            <ApplicationWorkflowPage />
          </SuspenseWrapper>
        ),
      },
      // User management
      {
        path: 'user-management',
        element: (
          <SuspenseWrapper>
            <UserManagementPage />
          </SuspenseWrapper>
        ),
      },
      // Profile
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <ProfilePage />
          </SuspenseWrapper>
        ),
      },
      // Settings
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <SystemSettingsPage />
          </SuspenseWrapper>
        ),
      },
      // 404 - Catch all
      {
        path: '*',
        element: (
          <SuspenseWrapper>
            <NotFoundPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
];

/**
 * Combined application routes configuration
 * Uses React Router v6 for URL-based routing
 * Public routes are added directly, protected routes are nested under '/'
 */
export const routes: RouteObject[] = [...publicRoutes, ...protectedRoutes];

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
  {} as Record<string, string>
);

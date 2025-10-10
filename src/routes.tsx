import type { RouteObject } from 'react-router-dom';
import { lazy, type ComponentType } from 'react';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('../components/pages/DashboardPage'));
const BeneficiariesPage = lazy(() =>
  import('../components/pages/BeneficiariesPageEnhanced')
);
const BeneficiaryDetailPage = lazy(() =>
  import('../components/pages/BeneficiaryDetailPageComprehensive')
);
const AidApplicationsPage = lazy(() =>
  import('../components/pages/AidApplicationsPage')
);
const AllAidListPage = lazy(() =>
  import('../components/pages/AllAidListPage')
);
const DonationsPage = lazy(() =>
  import('../components/pages/DonationsPage')
);
const ProfilePage = lazy(() =>
  import('../components/pages/ProfilePage')
);
const SystemSettingsPage = lazy(() =>
  import('../components/pages/SystemSettingsPage')
);
const UserManagementPage = lazy(() =>
  import('../components/pages/UserManagementPageReal')
);
const NotFoundPage = lazy(() =>
  import('../components/pages/NotFoundPage')
);
const LoginPage = lazy(() => import('../components/auth/LoginPage'));

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
      // Aid management module
      {
        path: 'yardim',
        children: [
          {
            index: true,
            element: <BeneficiariesPage />,
          },
          {
            path: 'ihtiyac-sahipleri',
            element: <BeneficiariesPage />,
          },
          {
            path: 'ihtiyac-sahipleri/:id',
            element: <BeneficiaryDetailPage />,
          },
          {
            path: 'basvurular',
            element: <AidApplicationsPage />,
          },
          {
            path: 'liste',
            element: <AllAidListPage />,
          },
        ],
      },
      // Donation module
      {
        path: 'bagis',
        children: [
          {
            index: true,
            element: <DonationsPage />,
          },
          {
            path: 'liste',
            element: <DonationsPage />,
          },
        ],
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
    acc[route] = module;
    return acc;
  },
  {} as Record<string, string>,
);

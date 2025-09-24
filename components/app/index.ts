/**
 * App Management Components
 *
 * Centralized exports for application management components
 */

export { default as AppInitializer } from './AppInitializer';
export {
  default as NavigationManager,
  NavigationProvider,
  useNavigation,
} from './NavigationManager';
export { default as NotificationManager, NotificationProvider } from './NotificationManager';
export { default as PageRenderer } from './PageRenderer';
export {
  ROUTE_REGISTRY,
  getRouteConfig,
  createLazyComponent,
  type RouteConfig,
} from './AppNavigation';

export type { NavigationState, NavigationActions } from './NavigationManager';

export type { NotificationState, NotificationActions } from './NotificationManager';

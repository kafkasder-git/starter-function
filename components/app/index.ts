/**
 * App Management Components
 *
 * Centralized exports for application management components
 */

export {
  default as NavigationManager,
  NavigationProvider,
  useNavigation,
} from './NavigationManager';
export { default as PageRenderer } from './PageRenderer';
export {
  ROUTE_REGISTRY,
  getRouteConfig,
  createLazyComponent,
  type RouteConfig,
} from './AppNavigation';

export type { NavigationState, NavigationActions } from './NavigationManager';

# AI Coding Agent Instructions for Kafkasder Management Panel

## Project Overview

This is a modern association management system (Dernek Yönetim Sistemi) built with React 18, TypeScript, Supabase, and Vite. It's a comprehensive Turkish-language system for managing non-profit associations with modules for members, donations, beneficiaries, campaigns, and more.

## Architecture Patterns

### State Management with Zustand

- **Store Pattern**: All stores in `stores/` use Zustand with middleware: `devtools`, `persist`, `subscribeWithSelector`, `immer`
- **Store Structure**: Each store exports `useXStore`, `xSelectors`, and `xStore` (see `stores/index.ts`)
- **Key Stores**: `authStore` (authentication), `uiStore` (UI state), `notificationStore` (notifications)
- **Initialization**: Use `useStoreInitialization()` hook for proper async store setup with graceful error handling

### Service Layer Architecture

- **Base Service Pattern**: All services extend `BaseService<T, TInsert, TUpdate, TFilters>` from `services/baseService.ts`
- **Entity Pattern**: Database entities implement `BaseEntity` interface with `id`, `created_at`, `updated_at`
- **Service Location**: Domain services in `services/` (e.g., `membersService.ts`, `donationsService.ts`)
- **API Pattern**: Services return `ApiResponse<T>` or `PaginatedResponse<T>` types
- **Direct Supabase Usage**: Some services like `MembersService` use Supabase directly instead of extending BaseService for specific query optimizations

### Supabase Integration

- **Client Setup**: Main client in `lib/supabase.ts` with auth config and RLS
- **Admin Client**: `supabaseAdmin` for RLS bypass operations
- **Table Constants**: Use `TABLES` constant for table names
- **Environment**: Centralized env management in `lib/environment.ts` with comprehensive validation
- **Safety**: Environment validation includes hardcoded credential detection for security

## Development Workflows

### Component Development

- **Location**: Components organized by domain in `components/` (auth, forms, pages, ui, charts, etc.)
- **Patterns**: Use React.memo for performance, lazy loading for charts (`components/charts/LazyCharts.tsx`)
- **UI Components**: Radix UI + Tailwind CSS for consistent desktop-first design system
- **Responsive Support**: Components in `components/mobile/` provide mobile fallbacks when needed
- **Desktop Focus**: Primary workflows designed for desktop users with keyboard shortcuts and complex interactions

### Testing Strategy

- **Unit Tests**: Vitest with jsdom environment (`vitest.config.ts`)
- **Service Tests**: Comprehensive service layer tests in `tests/services/`
- **Component Tests**: React Testing Library patterns in `components/__tests__/`
- **Test Commands**: `npm test`, `npm run test:coverage`, `npm run test:ui`

### Build & Development

- **Dev Server**: `npm run dev` (Vite with SWC)
- **Build**: `npm run build` (production optimized with tree shaking)
- **Quality Checks**: `npm run quality:check` (lint + type-check + format)
- **PWA**: Configured with VitePWA plugin for offline support
- **Bundle Analysis**: `npm run analyze` generates `dist/bundle-analysis.html`
- **Performance Monitoring**: Core Web Vitals tracking enabled

## Project-Specific Conventions

### File Organization

- **Absolute Imports**: Use `@/` prefix for imports (`@/components`,
  `@/services`)
- **Domain Grouping**: Features grouped by business domain, not technical type
- **Lazy Loading**: Heavy components wrapped with React.lazy and Suspense

### TypeScript Patterns

- **Pragmatic Strict Mode**: Strict mode enabled but selectively relaxed: `noImplicitAny: false`, `noUnusedLocals: false`, `noUnusedParameters: false` for development productivity while maintaining type safety
- **Interface Naming**: Entity interfaces match database table names
- **Generic Services**: Heavily typed service layer with generics for reusability
- **Build Performance**: Incremental compilation with `.tsbuildinfo` and `assumeChangesOnlyAffectDirectDependencies`

### Web-First Architecture with Mobile Support

- **Desktop-Optimized Components**: Primary focus on desktop layouts and interactions in `components/pages/` and `components/ui/`
- **Responsive Design**: Progressive enhancement from desktop to mobile using Tailwind responsive utilities
- **Mobile Enhancement Hooks**: Optional mobile optimizations available in `hooks/useAdvancedMobile.ts`, `hooks/useMobileFormOptimized.ts`, and `hooks/useMobilePerformance.ts`
- **Adaptive UI**: Components adapt gracefully to smaller screens but are optimized for desktop workflows
- **Touch Support**: Basic touch interactions for mobile users, with full desktop mouse/keyboard functionality as primary

### Performance Optimizations

- **Memoization**: Strategic use of useMemo/useCallback in performance-critical components
- **Code Splitting**: Route-based and component-based lazy loading
- **Bundle Analysis**: `npm run analyze` generates `dist/bundle-analysis.html`
- **Performance Monitoring**: Core Web Vitals tracking enabled
- **Chunk Splitting**: Manual chunks in `vite.config.ts` for vendor separation
- **Desktop Performance**: Optimized for desktop browsers with full feature sets
- **Mobile Performance**: Adaptive settings based on device capability detection (`useMobilePerformance`) as enhancement
- **Request Frame Optimization**: `usePerformanceOptimization` hook with `requestAnimationFrame` batching

### Turkish Language Support

- **UI Text**: All user-facing text in Turkish
- **Database**: Turkish field names and content
- **Comments**: Mix of English (technical) and Turkish (business logic)

### Environment & Security

- **Environment Validation**: `lib/environment.ts` includes comprehensive validation with hardcoded credential detection for security  
- **Security Checks**: CSRF protection, XSS prevention, input sanitization
- **RLS Enforcement**: All Supabase tables use Row Level Security
- **Test Mode Handling**: Environment validation is relaxed in test mode with default values

## Development Commands & Workflows

### Essential Commands
```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build           # Production build with optimizations
npm run preview         # Preview production build locally

# Quality & Testing
npm run quality:check   # Run lint + type-check + format check
npm run lint           # ESLint check only
npm run type-check     # TypeScript check only
npm run test           # Run all tests
npm run test:coverage  # Tests with coverage report

# Analysis & Monitoring
npm run analyze         # Generate bundle analysis report
```

### Build Configuration Details

- **Vite + SWC**: Fast compilation with SWC instead of Babel
- **PWA Manifest**: Includes Turkish shortcuts for key features
- **Terser Optimization**: Aggressive minification with console/debugger removal
- **Asset Optimization**: 4KB inlining limit, hashed filenames
- **Bundle Visualization**: `npm run analyze` generates detailed bundle analysis report

### ESLint Configuration

- **Strict Rules**: Security, React hooks, TypeScript strict checks
- **Test File Relaxation**: Looser rules for test files (no console warnings)
- **Import Optimization**: Unused imports auto-removal
- **Performance Rules**: Bundle size warnings, dependency checks

## State Management Patterns

### Auth Store (`stores/authStore.ts`)
- **Session Management**: Auto-refresh, expiry checking every 60 seconds
- **Rate Limiting**: 5 login attempts, 15-minute cooldown
- **Persist Strategy**: Only `rememberMe`, `loginAttempts`, `lastLoginAttempt`
- **Permission System**: Role-based with granular permissions

### UI Store (`stores/uiStore.ts`)
- **Comprehensive State**: Theme, mobile, modals, navigation, accessibility
- **Theme System**: Light/dark/system with CSS variable updates
- **Mobile Detection**: Auto-sidebar collapse, keyboard height tracking
- **Modal Stack**: Multiple modal support with overlay management

### Notification Store (`stores/notificationStore.ts`)
- **Persistence**: LocalStorage with JSON serialization
- **Categories**: member, donation, aid, campaign, system, general
- **Priority Levels**: low, medium, high, urgent
- **Realtime Ready**: Subscription infrastructure prepared

## Service Layer Patterns

### BaseService Extension
```typescript
class MyService extends BaseService<Entity, InsertType, UpdateType, Filters> {
  // Automatic pagination, filtering, search implementation
  async getAll(page, pageSize, filters) {
    // Apply search, date range, custom filters automatically
  }
}
```

### Direct Supabase Services
- **MembersService**: Complex queries with multiple OR conditions
- **Performance**: Direct Supabase calls for optimized queries
- **Logging**: Comprehensive error logging with context

## Component Architecture

### Page Components (`components/pages/`)
- **Domain Organization**: 25+ specialized pages (MembersPage, DonationsPage, etc.)
- **Layout Wrapper**: `PageLayout` component for consistent structure
- **Desktop-First Design**: Optimized for desktop workflows with keyboard navigation and complex data tables
- **Mobile Responsive**: Touch-optimized interactions as progressive enhancement

### Hook Patterns (`hooks/`)
- **Domain Hooks**: `useMembers`, `useDonations`, `useBeneficiaries`
- **Performance Hooks**: `useDebounce`, `useInfiniteScroll`, `usePagination`
- **Desktop Optimization**: Primary focus on desktop workflows and keyboard interactions
- **Mobile Enhancement**: Optional `useTouchDevice`, `useMobilePerformance`, `useAdvancedMobile`, `useMobileFormOptimized` for mobile users
- **Data Hooks**: `useSupabaseData`, `useSupabaseConnection`
- **Optimization Hooks**: `usePerformanceOptimization` with requestAnimationFrame batching

## Security Considerations

- **RLS**: All Supabase tables use Row Level Security
- **Auth Context**: `SupabaseAuthContext` for authentication state
- **CSRF Protection**: Middleware in `middleware/csrf.ts`
- **Rate Limiting**: Implemented in `middleware/rateLimit.ts`
- **Input Validation**: Client and server-side validation
- **Environment Security**: Hardcoded credential detection in build

## Integration Points

- **Supabase**: Primary database and auth provider
- **Vercel**: Deployment platform with optimized config
- **PWA**: Progressive Web App with offline capabilities
- **Real-time**: Supabase real-time subscriptions for live updates

## Common Tasks

- **Adding New Entity**: Create service extending BaseService, add to stores if
  needed
- **New Page**: Add to `components/pages/`, use PageLayout wrapper
- **Form Development**: Use react-hook-form with Radix UI components
- **Database Changes**: Update Supabase types and service layer
- **Performance Issues**: Check with React DevTools, use lazy loading patterns

## Key Files to Reference

- `App.tsx` - Main application structure and context providers
- `services/baseService.ts` - Service layer patterns
- `stores/authStore.ts` - Complex Zustand store example
- `lib/supabase.ts` - Database client configuration
- `lib/environment.ts` - Environment validation and configuration
- `vite.config.ts` - Build configuration and optimizations
- `tsconfig.json` - Pragmatic TypeScript strict mode settings

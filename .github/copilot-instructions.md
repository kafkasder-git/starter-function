# AI Coding Agent Instructions for Kafkasder Management Panel

## Project Overview

This is a modern association management system (Dernek Yönetim Sistemi) built
with React 18, TypeScript, Supabase, and Vite. It's a comprehensive
Turkish-language system for managing non-profit associations with modules for
members, donations, beneficiaries, campaigns, and more.

## Architecture Patterns

### State Management with Zustand

- **Store Pattern**: All stores in `stores/` use Zustand with middleware:
  `devtools`, `persist`, `subscribeWithSelector`, `immer`
- **Store Structure**: Each store exports `useXStore`, `xSelectors`, and
  `xStore` (see `stores/index.ts`)
- **Key Stores**: `authStore` (authentication), `uiStore` (UI state),
  `notificationStore` (notifications)
- **Initialization**: Use `useStoreInitialization()` hook for proper async store
  setup

### Service Layer Architecture

- **Base Service Pattern**: All services extend
  `BaseService<T, TInsert, TUpdate, TFilters>` from `services/baseService.ts`
- **Entity Pattern**: Database entities implement `BaseEntity` interface with
  `id`, `created_at`, `updated_at`
- **Service Location**: Domain services in `services/` (e.g.,
  `membersService.ts`, `donationsService.ts`)
- **API Pattern**: Services return `ApiResponse<T>` or `PaginatedResponse<T>`
  types

### Supabase Integration

- **Client Setup**: Main client in `lib/supabase.ts` with auth config and RLS
- **Admin Client**: `supabaseAdmin` for RLS bypass operations
- **Table Constants**: Use `TABLES` constant for table names
- **Environment**: Centralized env management in `lib/environment.ts`

## Development Workflows

### Component Development

- **Location**: Components organized by domain in `components/` (auth, forms,
  pages, ui, charts, etc.)
- **Patterns**: Use React.memo for performance, lazy loading for charts
  (`components/charts/LazyCharts.tsx`)
- **UI Components**: Radix UI + Tailwind CSS for consistent design system
- **Mobile Support**: Mobile-specific components in `components/mobile/`

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

## Project-Specific Conventions

### File Organization

- **Absolute Imports**: Use `@/` prefix for imports (`@/components`,
  `@/services`)
- **Domain Grouping**: Features grouped by business domain, not technical type
- **Lazy Loading**: Heavy components wrapped with React.lazy and Suspense

### TypeScript Patterns

- **Strict Config**: Strict mode enabled with selective relaxation for
  pragmatism
- **Interface Naming**: Entity interfaces match database table names
- **Generic Services**: Heavily typed service layer with generics for
  reusability

### Performance Optimizations

- **Memoization**: Strategic use of useMemo/useCallback in performance-critical
  components
- **Code Splitting**: Route-based and component-based lazy loading
- **Bundle Analysis**: `npm run analyze` for bundle size monitoring

### Turkish Language Support

- **UI Text**: All user-facing text in Turkish
- **Database**: Turkish field names and content
- **Comments**: Mix of English (technical) and Turkish (business logic)

## Security Considerations

- **RLS**: All Supabase tables use Row Level Security
- **Auth Context**: `SupabaseAuthContext` for authentication state
- **CSRF Protection**: Middleware in `middleware/csrf.ts`
- **Rate Limiting**: Implemented in `middleware/rateLimit.ts`

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
- `vite.config.ts` - Build configuration and optimizations

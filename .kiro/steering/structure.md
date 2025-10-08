# Project Structure

## Root Directory Organization

```
├── components/          # React components
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and helpers
├── services/           # Business logic and API services
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── middleware/         # Security and request middleware
├── tests/              # Test files and setup
├── public/             # Static assets
├── scripts/            # Build and utility scripts
└── docs/               # Documentation
```

## Component Organization

```
components/
├── accessibility/      # Accessibility features
├── analytics/         # Analytics and tracking
├── app/               # Core app components
├── auth/              # Authentication components
├── automation/        # Automation features
├── beneficiary/       # Beneficiary management
├── charts/            # Chart components
├── data/              # Data display components
├── forms/             # Form components
├── kumbara/           # Savings/piggy bank module
├── mobile/            # Mobile-specific components
├── notifications/     # Notification system
├── pages/             # Page-level components
├── pwa/               # PWA features
├── search/            # Search functionality
├── sync/              # Data synchronization
├── ui/                # Reusable UI components (shadcn/ui)
├── utils/             # Component utilities
├── ux/                # UX enhancements
└── __tests__/         # Component tests
```

## Key Directories

### `/services`

Business logic layer - each service handles a specific domain:

- `membersService.ts` - Member operations
- `donationsService.ts` - Donation management
- `beneficiariesService.ts` - Beneficiary operations
- `kumbaraService.ts` - Savings management
- `exportService.ts` - Data export functionality
- `baseService.ts` - Base service with common patterns

### `/hooks`

Custom React hooks for reusable logic:

- `useMembers.ts`, `useDonations.ts`, `useBeneficiaries.ts` - Data hooks
- `useSupabaseData.ts` - Generic Supabase queries
- `useLocalStorage.ts` - Local storage management
- `useDebounce.ts` - Debouncing utility
- `useMobileForm.ts` - Mobile form optimization
- `usePerformanceMonitoring.ts` - Performance tracking

### `/stores`

Zustand stores for global state:

- `authStore.ts` - Authentication state
- `notificationStore.ts` - Notification management
- `uiStore.ts` - UI state (theme, sidebar, modals)

### `/lib`

Core utilities and configurations:

- `supabase.ts` - Supabase client singleton
- `security.ts` - Security utilities
- `validation.ts` - Validation helpers
- `utils.ts` - General utilities
- `config.ts` - App configuration
- `auth/` - Authentication utilities
- `security/` - Security middleware and managers
- `performance/` - Performance optimization

### `/types`

TypeScript type definitions:

- `database.ts` - Database schema types
- `supabase.ts` - Supabase-specific types
- `auth.ts` - Authentication types
- `beneficiary.ts` - Beneficiary types
- `kumbara.ts` - Savings types
- `reporting.ts` - Report types

### `/middleware`

Request/response middleware:

- `security.ts` - Security headers and policies
- `csrf.ts` - CSRF protection
- `rateLimit.ts` - Rate limiting

### `/tests`

Test organization:

- `e2e/` - Playwright E2E tests
- `accessibility/` - Accessibility tests
- `hooks/` - Hook tests
- `services/` - Service tests
- `mocks/` - Mock data and handlers
- `setup.ts` - Test configuration

## Configuration Files

- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - Base TypeScript config
- `tsconfig.app.json` - App-specific TS config
- `tsconfig.node.json` - Node scripts TS config
- `tsconfig.test.json` - Test TS config
- `eslint.config.js` - ESLint configuration
- `tailwind.config.ts` - Tailwind CSS config
- `playwright.config.ts` - Playwright E2E config
- `vitest.config.ts` - Vitest test config

## Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
@/*              -> ./*
@components/*    -> ./components/*
@lib/*           -> ./lib/*
@services/*      -> ./services/*
@hooks/*         -> ./hooks/*
@stores/*        -> ./stores/*
@types/*         -> ./types/*
@utils/*         -> ./utils/*
```

## Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.ts`)
- **Services**: camelCase with 'Service' suffix (`userService.ts`)
- **Types**: PascalCase (`UserType.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE
- **Test files**: `*.test.ts` or `*.spec.ts`

## Architecture Patterns

- **Container/Presenter**: Smart containers handle logic, presentational
  components handle UI
- **Custom Hooks**: Reusable logic encapsulated in hooks
- **Service Layer**: Business logic isolated from components
- **Type Safety**: Full TypeScript coverage with strict mode
- **Security First**: Input sanitization, CSRF protection, rate limiting

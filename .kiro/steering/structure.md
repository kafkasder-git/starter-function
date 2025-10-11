# Project Structure

## Root Organization

```
/
├── components/          # React components (organized by feature/type)
├── contexts/           # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Core utilities and configurations
├── services/           # API services and business logic
├── stores/             # Zustand state management stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── src/                # Application entry point
├── tests/              # Test files and utilities
├── public/             # Static assets
└── dist/               # Build output (generated)
```

## Key Directories

### `/components`
Organized by feature domain and component type:
- `app/` - Core app components (navigation, routing)
- `auth/` - Authentication components (login, protected routes)
- `pages/` - Page-level components (one per route)
- `ui/` - Reusable UI primitives (buttons, inputs, dialogs)
- `shared/` - Shared components (error boundaries, loaders)
- `forms/` - Form components and field wrappers
- `[feature]/` - Feature-specific components (beneficiary, analytics, etc.)

### `/services`
Business logic and API integration:
- Each service handles one domain (beneficiaries, donations, etc.)
- Services use `baseService.ts` patterns
- All services return `ApiResponse<T>` format
- Database field mapping handled in services (Turkish DB ↔ English app)

### `/types`
TypeScript definitions:
- One file per domain (beneficiary.ts, donation.ts, etc.)
- Includes base types, insert/update types, filters, and stats
- Database field mapping functions (mapDBTo*, map*ToDB)
- Extends `BaseEntity<T>` from baseService

### `/lib`
Core infrastructure:
- `appwrite.ts` - Appwrite client initialization (singleton)
- `database.ts` - Database helpers and query builders
- `environment.ts` - Environment variable management
- `auth/` - Authentication services
- `security/` - Security middleware and utilities
- `logging/` - Logging infrastructure

### `/hooks`
Custom React hooks:
- Prefixed with `use*`
- Domain-specific hooks (useBeneficiaries, useDonations)
- Utility hooks (useDebounce, useLocalStorage, usePagination)
- Performance hooks (usePerformance, useLazyLoading)

### `/stores`
Zustand state stores:
- `authStore.ts` - Authentication state
- `notificationStore.ts` - Notifications
- `uiStore.ts` - UI state (sidebar, theme)
- Minimal stores, prefer React Query for server state

### `/src`
Application entry:
- `main.tsx` - React app mount point
- `App.tsx` - Root component with routing
- `routes.tsx` - Route definitions
- `index.css` - Global styles

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `BeneficiaryForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useBeneficiaries.ts`)
- **Services**: camelCase with `Service` suffix (e.g., `beneficiariesService.ts`)
- **Types**: camelCase (e.g., `beneficiary.ts`)
- **Utils**: camelCase (e.g., `validation.ts`)
- **Tests**: Same as source with `.test.ts(x)` or `.spec.ts(x)`

### Code
- **Components**: PascalCase (e.g., `BeneficiaryList`)
- **Functions**: camelCase (e.g., `getBeneficiaries`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DATABASE_ID`)
- **Types/Interfaces**: PascalCase (e.g., `Beneficiary`, `ApiResponse`)
- **Enums**: PascalCase (e.g., `BeneficiaryStatus`)

## Import Aliases

Configured in `tsconfig.json` and `vite.config.ts`:
- `@/*` - Root directory
- `@components/*` - Components directory
- `@lib/*` - Lib directory
- `@services/*` - Services directory
- `@hooks/*` - Hooks directory
- `@stores/*` - Stores directory
- `@types/*` - Types directory
- `@utils/*` - Utils directory

## Component Patterns

### Page Components
- Located in `components/pages/`
- Named with `Page` suffix (e.g., `BeneficiariesPageEnhanced.tsx`)
- Handle routing, layout, and data fetching
- Compose smaller feature components

### Feature Components
- Located in feature-specific folders (e.g., `components/beneficiary/`)
- Focused on single responsibility
- Export from `index.ts` for clean imports

### UI Components
- Located in `components/ui/`
- Based on Radix UI primitives
- Use `buttonVariants` pattern with CVA (class-variance-authority)
- Include accessibility features (ARIA, keyboard navigation)
- Support dark mode via Tailwind classes

## Database Integration

### Field Mapping
- Database uses Turkish field names (e.g., `ad_soyad`, `sehri`)
- Application uses English field names (e.g., `full_name`, `city`)
- Mapping functions in type files: `mapDBTo*` and `map*ToDB`
- Services handle mapping transparently

### Query Patterns
- Use `queryHelpers` from `lib/database.ts`
- Common queries: `equal`, `notEqual`, `orderAsc`, `orderDesc`, `limit`, `offset`
- Always handle pagination for large datasets
- Use `select` to limit returned fields when possible

## Testing Structure

- Unit tests: Co-located with source or in `__tests__` folders
- E2E tests: `tests/e2e/`
- Test utilities: `tests/utils.tsx`, `tests/setup.ts`
- Mocks: `tests/mocks/`
- Accessibility tests: `tests/accessibility/`

## Build Output

- `dist/assets/js/` - JavaScript chunks
- `dist/assets/css/` - CSS files
- `dist/assets/img/` - Images
- Chunk naming: `[name]-[hash:8].js` for cache busting

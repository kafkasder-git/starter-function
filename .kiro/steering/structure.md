# Project Structure & Organization

## Root Directory Structure

```
panel/
├── components/           # React components (feature-based organization)
├── src/                 # Main application entry points
├── types/               # TypeScript type definitions
├── stores/              # Zustand state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries and configurations
├── services/            # Business logic and API services
├── contexts/            # React context providers
├── utils/               # Pure utility functions
├── styles/              # Global CSS and theme files
├── tests/               # Test files and configurations
├── docs/                # Project documentation
├── public/              # Static assets
└── .kiro/               # Kiro AI assistant configuration
```

## Component Organization

### Feature-Based Structure
Components are organized by feature/domain rather than by type:

```
components/
├── ui/                  # Base UI components (Shadcn/ui)
├── layouts/             # Layout components (Header, Sidebar)
├── shared/              # Reusable components across features
├── auth/                # Authentication components
├── beneficiary/         # Beneficiary management
├── forms/               # Form components and field types
├── pages/               # Page-level components
├── notifications/       # Notification system
├── search/              # Search and filtering
├── analytics/           # Analytics and reporting
├── mobile/              # Mobile-specific components
└── pwa/                 # PWA-specific components
```

### Component Naming Conventions
- **PascalCase** for component names: `BeneficiaryList`, `UserProfile`
- **Descriptive and specific**: `BeneficiaryAidHistory` not `History`
- **File names match component names**: `BeneficiaryList.tsx`
- **Test files**: `BeneficiaryList.test.tsx`
- **Story files**: `BeneficiaryList.stories.tsx`

## Services Layer

### Service Organization
```
services/
├── baseService.ts           # Base service class with common functionality
├── beneficiariesService.ts  # Beneficiary CRUD operations
├── donationsService.ts      # Donation management
├── aidRequestsService.ts    # Aid request processing
├── userManagementService.ts # User and role management
├── fileStorageService.ts    # File upload/download
├── notificationService.ts   # Push notifications
├── exportService.ts         # Data export functionality
└── __tests__/               # Service unit tests
```

### Service Patterns
- All services extend `baseService.ts` for consistent error handling
- Services handle Appwrite integration and data transformation
- Each service includes TypeScript interfaces for request/response types
- Services are stateless and can be used across components

## Type System

### Type Organization
```
types/
├── index.ts             # Central export point for all types
├── auth.ts              # Authentication types
├── beneficiary.ts       # Beneficiary domain types
├── donation.ts          # Donation domain types
├── services.ts          # Service layer types
├── components.ts        # Component prop types
├── appwrite.ts          # Appwrite-specific types
└── globals.d.ts         # Global type declarations
```

### Type Conventions
- **Domain types**: Core business entities (User, Beneficiary, Donation)
- **Service types**: API request/response interfaces
- **Component types**: Props interfaces extending `BaseComponentProps`
- **Utility types**: Helper types for common patterns

## State Management

### Store Organization
```
stores/
├── index.ts             # Store exports and configuration
├── authStore.ts         # Authentication state
├── notificationStore.ts # Notification management
├── uiStore.ts           # UI state (modals, loading, etc.)
└── __tests__/           # Store unit tests
```

### Store Patterns
- **Zustand** for client state management
- **TanStack Query** for server state and caching
- Stores are modular and can be composed
- Each store includes TypeScript interfaces for state shape

## Routing Structure

### Route Organization
Based on application modules with nested routes:

```
/                        # Root redirect based on auth
/login                   # Authentication
/genel                   # Dashboard/General
/yardim/                 # Aid management
  ├── ihtiyac-sahipleri  # Beneficiaries
  ├── basvurular         # Aid applications
  └── dagitim            # Distribution tracking
/bagis/                  # Donations
  ├── liste              # Donation list
  └── kampanyalar        # Campaigns
/uye/                    # Member management
/fon/                    # Financial management
/hukuk/                  # Legal services
/ayarlar/                # Settings
```

## Import Path Conventions

### Path Aliases
Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
// Absolute imports using path aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { beneficiariesService } from '@/services';
import type { Beneficiary } from '@/types';

// Relative imports for same-level files
import { BeneficiaryCard } from './BeneficiaryCard';
import { useBeneficiaryForm } from '../hooks/useBeneficiaryForm';
```

### Import Organization
1. **React imports** first
2. **Third-party libraries**
3. **Internal imports** (using path aliases)
4. **Relative imports**
5. **Type-only imports** last

## File Naming Conventions

### General Rules
- **camelCase** for files: `userService.ts`, `beneficiaryUtils.ts`
- **PascalCase** for components: `BeneficiaryList.tsx`
- **kebab-case** for directories: `aid-requests/`, `user-management/`
- **Descriptive names**: `useBeneficiaryFilters.ts` not `useFilters.ts`

### Special Files
- **Test files**: `*.test.ts`, `*.spec.ts`
- **Story files**: `*.stories.tsx`
- **Type files**: `*.types.ts`, `*.d.ts`
- **Config files**: `*.config.ts`

## Documentation Structure

### Documentation Organization
```
docs/
├── COMPONENT_GUIDELINES.md     # Component development standards
├── MIGRATION_GUIDE.md          # Version migration instructions
├── DATABASE_FIELD_MAPPING.md   # Database schema documentation
└── SHADCN_UI_GUIDE.md         # UI component usage guide
```

## Mobile-First Considerations

### Responsive Organization
- **Mobile-first CSS**: Start with mobile styles, add desktop with breakpoints
- **Touch-friendly**: Minimum 44px touch targets
- **Progressive enhancement**: Core functionality works on all devices
- **Offline support**: PWA features for offline functionality

### Performance Optimization
- **Code splitting**: Route-based and component-based lazy loading
- **Bundle optimization**: Vendor chunking and tree shaking
- **Asset optimization**: Image compression and lazy loading
- **Caching strategies**: Service worker and browser caching
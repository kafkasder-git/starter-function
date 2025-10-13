# AI Agent Instructions for Kafkasder Management System

## Project Overview
This is a modern **nonprofit association management system** built with React + TypeScript + Vite, using **Appwrite** as the backend (BaaS). The system manages beneficiaries, donations, aid applications, campaigns, messaging, and more.

**Key Tech Stack:** React 18, TypeScript 5, Zustand, React Router, Vite 6, Appwrite SDK, Radix UI, Tailwind CSS 4, React Hook Form, Zod

## Architecture Fundamentals

### Backend: Appwrite Integration
- **All data operations go through Appwrite** (not traditional REST APIs)
- Client initialization: `lib/appwrite.ts` exports singleton instances (`account`, `databases`, `storage`, `functions`, `teams`)
- Database collections defined in `lib/database.ts` under `collections` constant
- **Critical:** Beneficiaries collection uses Turkish field names (`ad_soyad`, `telefon_no`) - use `FIELD_MAPPING` in `lib/database.ts`
- Environment setup: `.env` must contain `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`, `VITE_APPWRITE_DATABASE_ID`
- Setup scripts: `setup-appwrite-collections.sh` for initial database setup

### State Management: Zustand Stores
- **Three core stores** (all in `stores/`):
  - `authStore.ts`: Authentication, sessions, user roles/permissions
  - `uiStore.ts`: UI state (sidebar, modals, theme)
  - `notificationStore.ts`: Toast notifications
- All use Zustand middleware: `devtools`, `persist`, `subscribeWithSelector`, `immer`
- Import pattern: `import { useAuthStore } from '@/stores/authStore'`
- Safe initialization via `stores/safeInit.ts` prevents hydration issues

### Routing & Navigation
- Routes defined in `src/routes.tsx` - split into `publicRoutes` and `protectedRoutes`
- Protected routes require authentication via `components/auth/ProtectedRoute.tsx`
- Permission-based access using `Permission` enum from `types/auth.ts`
- Turkish URL paths (e.g., `/yardim/ihtiyac-sahipleri` for beneficiaries)

### Service Layer Pattern
- Base service at `services/baseService.ts` provides common CRUD utilities
- Services named `<domain>Service.ts` (e.g., `beneficiariesService.ts`, `donationsService.ts`)
- Most services follow singleton pattern with `getInstance()` method
- Use `serviceManager.ts` for coordinated multi-service operations

## Development Workflows

### Running the Application
```bash
npm run dev              # Start dev server (default port 5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run type-check:all   # TypeScript checks across all configs
```

### Testing
```bash
npm test                 # Vitest unit tests
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
npm run test:e2e:ui      # Playwright UI mode
```

### Code Quality
```bash
npm run lint:fix         # ESLint auto-fix
npm run format           # Prettier format all files
npm run quality:check    # Lint + type-check + format check
npm run dead-code        # Find unused exports (ts-prune)
npm run unused-deps      # Find unused dependencies (depcheck)
```

## Critical Conventions

### Path Aliases (tsconfig.json)
Always use path aliases for imports:
- `@/` → project root
- `@components/` → `./components/`
- `@lib/` → `./lib/`
- `@services/` → `./services/`
- `@hooks/` → `./hooks/`
- `@stores/` → `./stores/`
- `@types/` → `./types/`
- `@utils/` → `./utils/`

### UI Component Library: Kibo UI
- Custom component library in `components/kibo-ui/`
- Export all components via `components/kibo-ui/index.ts`
- Usage: `import { Button, Card, Input } from '@/components/kibo-ui'`
- See `KIBO_UI_INTEGRATION.md` for component variants and props
- Gantt chart available at `/genel/gantt` (see `GANTT_COMPONENT_README.md`)

### Form Handling Pattern
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/kibo-ui';

const schema = z.object({ /* schema */ });
const form = useForm({ resolver: zodResolver(schema) });
```

### Appwrite Data Operations
```typescript
import { databases, ID, Query } from '@/lib/appwrite';
import { collections } from '@/lib/database';

// Create
await databases.createDocument(DATABASE_ID, collections.BENEFICIARIES, ID.unique(), data);

// List with filters
await databases.listDocuments(DATABASE_ID, collections.DONATIONS, [
  Query.equal('status', 'approved'),
  Query.orderDesc('created_at')
]);

// Update
await databases.updateDocument(DATABASE_ID, collections.AID_APPLICATIONS, docId, updates);
```

### Authentication & Permissions
- Check auth state: `const { isAuthenticated, user } = useAuthStore()`
- Permission checks: `user?.permissions.includes(Permission.MANAGE_FINANCIAL)`
- Wrap restricted content: `<ProtectedRoute requiredPermission={Permission.VIEW_AID}>`
- Role hierarchy: `ADMIN > MANAGER > OPERATOR > VIEWER` (defined in `types/auth.ts`)

### Mobile & PWA Features
- Mobile-specific hooks: `useAdvancedMobile`, `useMobilePerformance`, `useHapticFeedback`
- PWA config in `vite.config.ts` (currently commented out)
- Mobile form component: `components/mobile/SmartMobileForm.tsx`
- Pull-to-refresh: `components/PullToRefresh.tsx`

### Messaging System
- Real-time messaging via Appwrite Realtime API
- Collections: `conversations`, `messages`, `message_attachments`, `user_presence`, `typing_indicators`
- Setup: `setup-messaging-collections.sh`
- Hooks: `useMessaging`, `useRealtimeMessaging`, `useVoiceRecorder`
- See `MESSAGING_SYSTEM_README.md` for full details

## Error Handling & Logging
- Centralized logger: `import { logger } from '@/lib/logging/logger'`
- Specialized loggers: `authLogger`, `apiLogger`, `storeLogger`
- Error boundaries: Wrap route components with `ErrorBoundary` from `components/shared/ErrorBoundary`
- Global error handlers in `src/main.tsx` catch unhandled rejections and script errors

## Common Gotchas

1. **Turkish field names in beneficiaries collection** - always use `FIELD_MAPPING` from `lib/database.ts`
2. **Singleton pattern** - many services/stores use singletons; check for `getInstance()` before creating new instances
3. **Zustand persistence** - stores persist to localStorage; clear browser storage when debugging auth issues
4. **Strict TypeScript** - `tsconfig.json` has all strict flags enabled; expect type errors for implicit any/undefined
5. **Appwrite configuration** - app runs in mock mode if Appwrite env vars missing; check `lib/appwrite.ts` for validation
6. **Path imports** - always use `@/` aliases, never relative paths like `../../`

## Testing Patterns
- Unit tests use Vitest with `jsdom` environment
- Test setup in `tests/setup.ts`
- Mock Appwrite services in tests (see `services/__tests__/` for examples)
- E2E tests use Playwright (config: `playwright.config.ts`)

## Performance Considerations
- Code splitting: Use React `lazy()` for route components (see `components/LazyComponents.tsx`)
- Vite config drops console/debugger in production builds
- Bundle analysis: `npm run analyze:chunks`
- Lighthouse CI: `npm run lighthouse` (requires dev server running)

## Deployment
- Production builds via `npm run build` output to `dist/` directory
- Static hosting compatible (SPA with client-side routing)
- Ensure all Appwrite environment variables are set in production

## References
- **Appwrite docs:** Full database schema in `appwrite.json` (371 lines)
- **Setup guides:** `APPWRITE_SETUP_COMPLETE.md`, `MESSAGING_SYSTEM_README.md`, `KIBO_UI_INTEGRATION.md`
- **Example routes:** `/genel/ui-showcase`, `/genel/form-examples`, `/genel/gantt`

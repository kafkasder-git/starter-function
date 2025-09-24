# Kafkasder Management Panel - AI Coding Guidelines

## Architecture Overview

This is a **Dernek Yönetim Sistemi** (Association Management System) - a modern React/TypeScript admin panel for non-profit organizations. Built with Vite, Supabase, and a layered service architecture.

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite + SWC
- **Backend**: Supabase (auth, database, real-time)
- **State**: Zustand stores + React Context providers
- **UI**: Radix UI components + Tailwind CSS
- **Build**: Vite with PWA support, Sentry monitoring

## Essential Architecture Patterns

### Service Layer Pattern
All business logic lives in `services/` using inheritance from `BaseService<T>`:

```typescript
// services/baseService.ts - Abstract base class for all services
export abstract class BaseService<
  T extends BaseEntity,
  TInsert,
  TUpdate,
  TFilters extends BaseFilters = BaseFilters,
> {
  protected delay(ms: number = SERVICE_CONFIG.DEFAULT_DELAY_MS): Promise<void>
  protected paginateResults<TData>(data: TData[], page: number, pageSize: number): PaginatedResponse<TData>
  protected applySearchFilter(data: T[], searchTerm: string, searchFields: (keyof T)[]): T[]
}
```

Key services: `membersService`, `donationsService`, `beneficiariesService`, `aidRequestsService`

### Context + Store Hybrid
- **React Contexts**: Authentication (`SupabaseAuthContext`), notifications
- **Zustand Stores**: UI state (`uiStore`), complex client state
- **Pattern**: Use contexts for auth/user data, stores for UI/app state

```typescript
// Pattern: Auth state via context, UI state via store
const { user, isAuthenticated } = useSupabaseAuth(); // Context
const { sidebarCollapsed, setSidebarCollapsed } = useUIStore(); // Zustand store
```

### Component Organization
```
components/
├── [feature]/          # Feature-specific (beneficiary/, auth/, etc.)
├── [utility]/          # Cross-cutting (ui/, utils/, accessibility/)
└── [layout]/           # Layout components (Header, Sidebar, PageLayout)
```

### AI Integration Architecture
Centralized AI provider in `components/ai/EnhancedAIProvider.tsx`:
- Multi-provider support (OpenRouter, OpenAI, Anthropic)
- Turkish language optimization (`language: 'tr'`)
- Usage tracking and cost monitoring
- Context-aware responses for the dernek domain

## Critical Development Workflows

### Environment Setup
```bash
npm run dev          # Development server with HMR
npm run build       # TypeScript check + Vite build
npm run preview     # Preview production build
npm run lint:fix    # ESLint with auto-fix
```

### Supabase Integration
Check `lib/supabase.ts` for connection status. The app gracefully handles missing Supabase config:
```typescript
// Pattern: Always check isSupabaseConfigured before real-time features
if (isSupabaseConfigured) {
  // Use real Supabase features
} else {
  // Fall back to mock data/local storage
}
```

### Component Development
- **Use TypeScript strict mode** - all `tsx` files require proper typing
- **Follow component patterns**: Wrap in `ErrorBoundary`, use `SafeWrapper` for mobile
- **Path aliases**: Import from `@/` (maps to root directory)
- **State management**: UI state → Zustand, Auth → Context, Data → Services

## Project-Specific Conventions

### Turkish Language Support
This is a Turkish application (`lang: 'tr'` in manifest):
- UI text in Turkish
- Date/number formatting for Turkish locale
- AI prompts optimized for Turkish context
- Comments can be in English, but user-facing text in Turkish

### Mobile-First Responsive Design
Mobile optimization is critical:
- `components/mobile/` for mobile-specific components
- `hooks/useMobileForm.ts`, `useTouchDevice.ts` for mobile interactions
- PWA configured in `vite.config.ts` with Turkish manifest

### Security & Performance Patterns
- **Rate limiting**: Implemented in `middleware/rateLimit.ts`
- **Input validation**: `lib/validation.ts` + Zod schemas
- **Error boundaries**: Wrap components with `ErrorBoundary` or `StoreErrorBoundary`
- **Performance monitoring**: Sentry integration with `lib/sentryInit.ts`

### Data Flow Architecture
1. **Services** handle all external API calls (Supabase/mock data)
2. **Hooks** (`hooks/`) provide React integration for services
3. **Stores** manage client-side state with persistence
4. **Components** consume via hooks, never directly call services

## Key Integration Points

### Authentication Flow
```typescript
// Pattern: Always use SupabaseAuthContext for auth state
const { user, isAuthenticated, signIn, signOut } = useSupabaseAuth();
```

### Data Fetching Pattern
```typescript
// Pattern: Services return consistent ApiResponse<T> format
const response = await membersService.getMembers(filters);
if (response.success) {
  // Handle data
} else {
  // Handle error
}
```

### AI Feature Integration
```typescript
// Pattern: Use EnhancedAIProvider for all AI features
const { generateContent, trackAIUsage } = useAI();
const response = await generateContent(prompt, { language: 'tr' });
```

### Validation Pattern
```typescript
// Pattern: Use centralized validation utilities
import { VALIDATION_PATTERNS, sanitizeInput } from '@/lib/validation';

// Turkish phone validation, IBAN validation, etc.
const isValidPhone = VALIDATION_PATTERNS.phone.test(phoneNumber);
const sanitizedInput = sanitizeInput.html(userInput);
```

### PWA Configuration
```typescript
// vite.config.ts - Extensive PWA setup with Turkish shortcuts
VitePWA({
  manifest: {
    name: 'Dernek Yönetim Sistemi',
    short_name: 'DernekYS',
    lang: 'tr',
    shortcuts: [
      { name: 'Yardım Başvuruları', url: '/#/yardim/basvurular' },
      { name: 'Bağış Kaydet', url: '/#/bagis/yeni' },
      // ... more Turkish shortcuts
    ]
  }
})
```

## Development Commands & Debugging

### Essential Commands
- `npm run type-check` - Validate TypeScript without build
- `npm run analyze` - Bundle analyzer for performance debugging
- `npm run test:coverage` - Run tests with coverage report

### Debugging Tips
- Check browser console for Supabase connection status logs
- Use React DevTools for Zustand store inspection
- Sentry captures errors in production - check dashboard
- AI usage tracking available in browser DevTools under "AI"

### Build Configuration
- **Path aliases**: `@/*` maps to `./` (configured in `tsconfig.json`)
- **PWA**: Extensive offline support with service worker
- **Bundle analysis**: `npm run analyze` generates visual bundle report
- **Sentry**: Error monitoring with source maps (commented out in config)

### Testing Strategy
- **Vitest**: Modern testing framework with UI mode
- **Coverage**: `npm run test:coverage` for detailed reports
- **Service mocking**: All services support mock data fallback

Remember: This codebase prioritizes **Turkish language support**, **mobile responsiveness**, and **graceful degradation** when external services (Supabase) are unavailable.
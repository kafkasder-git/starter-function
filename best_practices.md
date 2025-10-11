# 📘 Project Best Practices

## 1. Project Purpose
Kafkasder Yönetim Sistemi is a modern corporate admin panel for managing beneficiaries, donations, campaigns, and related workflows. It is a React + TypeScript single-page application built with Vite, integrating Appwrite as the backend, and designed with performance, accessibility, and PWA/offline capabilities in mind.

## 2. Project Structure
High-level layout and roles of key directories:

- /src
  - Entry points and application shell
  - src/main.tsx: App bootstrap and rendering
  - src/App.tsx: Root component
  - src/routes.tsx: Routing configuration
  - src/components/: Local UI building blocks used within src
  - src/styles/: App-level styles imported by src
- /components
  Feature-oriented UI and widgets organized by domain; generally framework-agnostic React components (TSX) and UI composites.
  - /components/auth: Guards, auth UI (e.g., PermissionGuard)
  - /components/pages: Page-level components/containers
  - /components/ui, /components/shared, /components/layouts: Reusable UI primitives and layout components
  - /components/analytics, /components/accessibility, /components/pwa, /components/charts: Cross-cutting UI utilities
- /hooks
  Reusable React hooks, domain and cross-cutting concerns (e.g., useAppwriteData, usePermissions, useBackgroundSync, useDebounce, usePagination, useToast, etc.).
- /services
  Service layer responsible for data access, server interactions, and domain logic abstraction. Wraps Appwrite SDK and other backends (e.g., OCR, notifications). Common patterns include a base service (baseService.ts), validation helpers, and error handling.
- /lib
  Cross-cutting library layer (auth, security, storage, logging, performance, middleware). Contains Appwrite client config (appwrite.ts), environment/config management, error handling, and utilities used by services/hooks.
- /stores
  Zustand stores for state management (e.g., authStore, uiStore). Keep local client state decoupled from server state (managed by React Query).
- /contexts
  React contexts (e.g., NotificationContext, SidebarContext) shared across the app.
- /middleware
  Client-side middleware-like utilities (e.g., rate limiting, security helpers) used by services/hooks.
- /utils
  Pure utilities, helpers, and small shared functions.
- /public
  Static assets, PWA manifest (manifest.webmanifest), icons.
- /docs
  Project documentation (component guidelines, database field mapping, migration guides).
- /tests
  Centralized tests by category: accessibility, e2e, hooks, mocks, services, utils. Global setup in tests/setup.ts; shared test utils in tests/utils.tsx.
- /scripts
  Repo maintenance/analysis scripts (e.g., structure comparison, service tests).
- /styles
  Global CSS and Tailwind setup.

Configuration and setup files:
- index.html: Application root HTML
- vite.config.ts: Build and dev server configuration (Vite + PWA plugin)
- tailwind.config.ts, postcss.config.js: Styling pipeline
- .env.example: Environment variable template (use VITE_ prefix for client-side)
- eslint.config.js, .eslintrc.review.json, prettier.config.cjs: Linting/formatting
- vitest.config.ts, tsconfig.*.json: Testing and TypeScript configuration
- playwright.config.ts: E2E configuration
- .nvmrc and engines in package.json: Node >= 22 and npm >= 10

Separation of concerns:
- UI in components and src
- State in stores and contexts
- Data fetching and domain logic in services using lib utilities
- Cross-cutting behavior (auth, security, logging, performance) in lib
- Hooks bridge UI with services/stores while encapsulating side effects

## 3. Test Strategy
Frameworks and tools:
- Unit/Integration: Vitest + @testing-library/react + @testing-library/user-event
- Mocking: MSW for network mocking; vi.mock for module mocking
- Accessibility: jest-axe and @axe-core/react for a11y assertions/runtime checks
- E2E: Playwright (UI flows and regression)

Organization:
- Colocated tests: __tests__ folders across components/hooks/lib/services/stores/types
- Central tests: /tests with categories (accessibility, e2e, hooks, mocks, services, utils)
- Global setup: tests/setup.ts and vitest.d.ts for custom jest-style matchers and RTL setup
- Naming: *.test.ts, *.test.tsx (unit/integration); E2E specs under tests/e2e

Guidelines:
- Unit tests
  - Target pure utils, validation, and small hooks/services
  - Use vi.fn and msw when interaction with network is required
- Integration tests
  - Test components with realistic stores and service interactions
  - Prefer RTL queries by role/label/text to reflect user behavior
  - Mock server communication via MSW; avoid shallow rendering
- E2E tests
  - Validate critical user journeys (auth, permissions, CRUD flows)
  - Run locally with npm run test:e2e and open reports with npm run test:e2e:report:open

Coverage expectations:
- Aim for >= 80% statements/branches on critical layers (services, hooks, utils). Use npm run test:coverage.

Accessibility testing:
- Add jest-axe checks for page-level and complex components
- Prefer Radix UI primitives and maintain focus management; assert no-violations in tests

## 4. Code Style
Language and framework:
- TypeScript-first: enable strict typing, prefer explicit types for public APIs, use generics as needed
- React function components with hooks; avoid class components
- Server state via @tanstack/react-query; local UI state via Zustand/contexts
- Forms: react-hook-form + zod (via @hookform/resolvers) for validation

Naming conventions:
- Components: PascalCase (e.g., PermissionGuard.tsx, AppwriteConnectionStatus.tsx)
- Hooks: useCamelCase (e.g., usePermissions.ts)
- Services: DomainService.ts (e.g., donationsService.ts)
- Stores: domainStore.ts (e.g., authStore.ts)
- Utilities: camelCase filenames and functions
- Tests: <name>.test.ts(x) colocated or under /tests

Formatting and linting:
- Prettier for formatting; ESLint with react, hooks, security, and unused-imports rules
- Pre-commit hooks via husky + lint-staged; run npm run quality:check prior to PRs

Comments and documentation:
- Prefer self-explanatory code and clear naming
- Use JSDoc or TSDoc for complex functions, public utilities, and services
- Document side effects, performance constraints, and assumptions

Error and exception handling:
- Centralize in services and lib/errorHandling.ts or services/errorHandler.ts
- Do not swallow errors; map to user-friendly toasts via ToastProvider and log details for diagnostics
- Sanitize any HTML with DOMPurify; validate inputs with zod before processing
- Use networkDiagnostics and performance tools for tracing issues; consider retry/backoff via React Query

## 5. Common Patterns
- Service layer abstraction
  - Base service (baseService.ts) pattern for shared concerns (error mapping, validation)
  - Appwrite SDK access centralized in lib/appwrite.ts and enhanced services
- Data fetching and caching
  - React Query for caching, deduplication, background refetch, and mutations
  - Prefer query/mutation hooks that encapsulate service calls
- State management
  - Zustand stores for UI state; avoid mixing server state into stores
  - Derive state when possible; avoid deep mutations
- Permissions and roles
  - usePermission(s) hooks and components/auth/PermissionGuard.tsx guard UI/actions
  - Central roleMapping.ts defines role-to-permission mapping
- Forms and validation
  - react-hook-form with zod schemas; use @hookform/resolvers for DX
- PWA and offline-first
  - Background sync (useBackgroundSync), connection status components, safe navigation hooks
  - Prefer idempotent mutations with retry and outbox patterns where applicable
- Performance and UX
  - Lazy loading (LazyComponents.tsx), useDebounce/useInfiniteScroll, usePerformance hooks
  - Avoid heavy work on main thread; prefer web worker/async offloading if needed
- Security and safety
  - secureStorage.ts for tokens/secrets; CSRF and token refresh hooks
  - Sanitize HTML and validate all external input

## 6. Do's and Don'ts

### Quality Gates
Before committing or merging:
1. ✅ All TypeScript errors resolved (`npm run type-check:all`)
2. ✅ No ESLint errors (`npm run lint:check`)
3. ✅ Code formatted (`npm run format:check`)
4. ✅ Tests passing (`npm run test`)
5. ✅ No security vulnerabilities (`npm audit`)

Use the pre-commit check:
```bash
npm run quality:check  # Runs all checks
```

✅ Do
- Keep business logic in services/lib, not in React components
- Use React Query for all network/server-state operations
- Validate with zod and sanitize with DOMPurify for any HTML content
- Protect actions and views with PermissionGuard and usePermissions
- Use ToastProvider for consistent user feedback
- Write tests for new services/hooks and critical UI interactions
- Run npm run quality:check before committing; keep CI green
- Use environment variables (VITE_*) and never hardcode secrets

❌ Don’t
- Call Appwrite or other SDKs directly from components; go through services
- Mutate Zustand state directly; always use the store’s set function and immutable patterns
- Bypass React Query cache with ad-hoc fetches
- Use innerHTML without sanitization
- Swallow or ignore errors; always handle and surface appropriately
- Introduce global side effects in components or tests without cleanup
- Commit generated artifacts or credentials

## 7. Tools & Dependencies
Key libraries:
- React 18, TypeScript 5, Vite 7
- UI: Radix UI primitives, Tailwind CSS, Lucide icons
- State: Zustand; Server state: @tanstack/react-query
- Forms/Validation: react-hook-form, zod
- Backend: Appwrite client (appwrite, node-appwrite)
- Media/OCR: tesseract.js
- PWA: vite-plugin-pwa, workbox-window
- Security: DOMPurify/isomorphic-dompurify, crypto-js
- Testing: Vitest, RTL, MSW, Playwright, jest-axe/@axe-core/react
- Tooling: ESLint, Prettier, Husky, lint-staged, Lighthouse

Setup and scripts:
- Requirements: Node >= 22, npm >= 10 (.nvmrc provided)
  - **Current:** Node v22.20.0 LTS (October 2024), npm v10.9.3
  - Use `nvm use` or `nvm install` to switch to the correct version
- Install: npm install
- Develop: npm run dev (Vite dev server)
- Test: npm run test, npm run test:coverage, npm run test:e2e
- Lint/Format: npm run lint, npm run format; fix with npm run quality:fix
- Type-check: npm run type-check:all
- Storybook: npm run storybook (if needed for UI development)
- Lighthouse: npm run lighthouse (ensure dev server is running)

Environment and config:
- Copy .env.example to .env; use VITE_* vars for client access
- Keep secrets out of the repo; use environment-specific files

## 8. Other Notes
- When adding a new service:
  - Consider extending baseService; put API specifics in services/<domain>Service.ts
  - Add unit tests under services/__tests__/ with MSW for network interactions
  - Define/extend shared types in /types as needed
- When adding hooks:
  - Encapsulate React Query logic and error handling
  - Keep hooks pure (return data, status, actions); avoid embedding UI
- When adding components:
  - Prefer composition with existing UI primitives; keep them presentational
  - Gate privileged actions with PermissionGuard
- Appwrite integration:
  - Use lib/appwrite.ts for client and config; do not re-initialize in components
  - Keep authentication flows within services and hooks (token refresh, CSRF)
- i18n considerations:
  - Centralize user-facing strings; plan for translation (internationalizationService)
- Accessibility:
  - Use semantic HTML and Radix primitives; verify with jest-axe; ensure focus and ARIA attributes
- Offline and background sync:
  - Use useBackgroundSync and related helpers for robust offline flows; handle retries and conflicts
- Mobile UX:
  - Prefer useAdvancedMobile/useMobilePerformance hooks to optimize interactions and performance

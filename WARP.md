# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Kafkasder Management Panel (React + Vite + TypeScript)
Domain: Non-profit association management system (Dernek Yönetim Sistemi) with Turkish UI

Commands you’ll use most
- Install deps
  - npm install
  - For CI-like installs: npm ci
- Environment
  - Copy and edit env: cp .env.example .env.local
  - Required keys (examples): VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_NAME, VITE_APP_VERSION
- Dev server
  - npm run dev
- Build and preview
  - npm run build
  - npm run preview
- Lint, format, types
  - npm run lint
  - npm run lint:fix
  - npm run format
  - npm run format:check
  - npm run type-check
- Tests (Vitest)
  - Run all: npm test
  - Coverage: npm run test:coverage
  - UI runner: npm run test:ui
  - Single file examples:
    - npm test -- components/__tests__/Header.test.tsx
    - npm test -- hooks/__tests__/useSupabaseConnection.test.ts
    - npm test -- tests/services/kumbaraService.test.ts
  - Filter by name: npm test -- -t "should handle empty state"
  - Advanced filtering:
    - By test name regex: npm test -- -t "^useMembers .*empty$"
    - Specific test in a file: npm test -- hooks/__tests__/useSupabaseConnection.test.ts -t "reconnects on failure"
- E2E (Playwright)
  - First-time setup: npm run browsers:install
  - Run: npm run test:e2e
  - Open UI: npm run test:e2e:ui
  - HTML report (CI/local): npm run test:e2e -- --reporter=html && npx playwright show-report
- Security and dependencies
  - Audit: npm audit
  - Security JSON: npm run security:check
  - Update deps: npm run deps:update
  - Outdated: npm run deps:check
- Bundle analysis
  - npm run analyze
- Housekeeping
  - Clean: npm run clean (uses rm -rf)
  - Windows clean (recommended): npm run clean:win
  - Fresh install: npm run fresh
  - Import cleanup: npm run cleanup:imports
  - All cleanup: npm run cleanup:all
- Code Quality Shortcuts
  - Full quality check: npm run quality:check (lint + type-check + format)
  - Auto-fix everything: npm run quality:fix

Environment and tooling
- Node and npm: engines require Node >= 22 and npm >= 10 (CI uses Node 22). If your local version differs from README, prefer package.json engines and CI.
- Dev server: Vite (default port 5173, opens browser).
- Path aliases: “@” maps to the repo root (see tsconfig.json and vite.config.ts). Prefer imports like @/services/… over relative ladders.
  - Example: import { membersService } from '@/services/membersService';
- Platform: Optimized for Windows development (PowerShell commands work). For Unix-like commands in docs, adapt as needed.
  - If npm run clean fails (rm -rf), use: npm run clean:win
- Git hooks: Husky runs pre-commit hooks (lint-staged). Auto-formats on commit.
- Formatting: Prettier configured via prettier.config.cjs with Tailwind plugin
- Node 22 selection (Windows): If using nvm-windows: nvm use 22.x.x

High-level architecture
- Overall: Single-app React 18 + Vite + TypeScript codebase. Styling via Tailwind, UI primitives via Radix UI, PWA enabled via vite-plugin-pwa. Data layer built around Supabase.
- Key directories (big picture):
  - components/: UI and page-level React components (see components/pages for feature pages)
    - pages/: ~35 feature pages (members, donations, beneficiaries, legal, finance, etc.)
    - forms/: Shared form components with React Hook Form
    - ui/: Reusable UI components
  - services/: Business logic and external I/O (all Supabase/API access lives here)
    - Core services: beneficiariesService, donationsService, membersService, kumbaraService
    - Supporting: notificationService, exportService, fileStorageService, etc.
  - hooks/: Custom React hooks, generally orchestrating service calls for components
  - stores/: Zustand global state stores (UI state, auth/notifications wiring)
  - contexts/: React contexts (e.g., SupabaseAuthContext)
  - lib/: Cross-cutting utilities (environment, logging, validation, security, supabase client)
    - security/: Input sanitization, permission manager, API security middleware
  - types/: Centralized TypeScript types (domain entities, reporting, supabase, etc.)
  - tests/: Vitest setup, MSW handlers, and targeted tests alongside feature tests
- Data flow convention (enforced culturally and in CI): Service -> Hook -> Component
  - Components do not call Supabase or external APIs directly
  - Hooks coordinate data fetching/mutation by calling services
  - Services encapsulate all Supabase and external integrations
- Supabase integration: Centralized in lib/supabase.ts and service layer. Avoid importing Supabase directly in components/hooks.
- State management: Zustand stores live in stores/ (e.g., authStore, notificationStore, uiStore). Components read/write state via these stores.
- Build config: vite.config.ts sets aliases and PWA, splits vendor chunks, and enables terser minification. tsconfig.json uses baseUrl "." and maps "@/*" to project root; tsconfig.node.json scopes type-checking for node-side configs.
- Testing: Vitest uses jsdom with tests/setup.ts. MSW is configured for request mocking; matchers from @testing-library/jest-dom are enabled. Coverage is configured via V8. CI expects ~80%+ coverage in some workflows.

Important rules from .github/copilot-instructions.md
- Service-only external access: All Supabase and external API calls must live in services/. Components and hooks must not import Supabase clients directly.
- Strict data flow: Service -> Hook -> Component. Keep business logic in services and use hooks for UI-side orchestration.
- No mock data in production code: MSW is for tests; do not add mock/fake/dummy data paths in app code. CI will fail on such patterns.
- Keep to project stack: Do not introduce state libraries (Redux/MobX) or UI kits outside what's already used (Zustand, Radix UI, Tailwind).
- Turkish UX: UI strings are Turkish; AI prompts and validation patterns should respect Turkish locale.
  - Use lib/validation.ts for Turkish-specific patterns (phone, TC ID, etc.)
- Imports: Prefer the "@/" alias consistently.
- Testing guidance: When adding tests, include error paths and edge cases—don't only test the happy path.
- Security: Always use InputSanitizer from lib/security for user inputs
- Type safety: ApiResponse<T> wrapper for all service returns

CI/CD highlights (.github/workflows)
- quality.yml: Type-check, ESLint, build, quality reports. Simple compliance checks for direct Supabase usage in components/hooks, console usage, and mock data in prod code.
- deploy.yml: On pushes/PRs to main, runs checks, tests, coverage (target 80%+), builds, and deploys to Vercel with repository secrets (VERCEL_TOKEN/ORG_ID/PROJECT_ID).
- release.yml: Tag-driven releases (v*), builds, tests, archives, generates changelog, creates GitHub Releases, and can deploy to production.
- security.yml: npm audit, security validation, dependency review, CodeQL, and vulnerability threshold gating.

Notes for writing code
- Prefer importing via @/… and keep service boundaries clean. If you find Supabase used in hooks/components, migrate that logic into the corresponding service under services/ and use a hook to consume it.
- When adding a feature:
  - Add service methods (services/*Service.ts)
  - Add a hook in hooks/ that uses the service
  - Render with components/, wiring any global UI state via stores/

Troubleshooting quick checks
- Type issues: npm run type-check
- ESLint issues: npm run lint:fix
- Supabase env: ensure .env.local has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Bundle questions: npm run analyze
- PWA/preview cache: In preview, the service worker may cache assets. If you see stale UI after changes, hard refresh (Ctrl+F5) or remove the service worker from DevTools > Application > Service Workers.
- PWA update flow: registerType = 'autoUpdate' means SW fetches updates in background; the new version activates on the next reload after it finishes installing.

Known issues being fixed (from PROJECT_STATUS.md)
- Operator logic errors: Some files have !value ?? expression patterns that should be value && expression
- Affected files: hooks/useKeyboard.ts, components/ai/EnhancedAIProvider.tsx, lib/environment.ts, etc.
- Logger path issue: components/notifications/NotificationBell.tsx has incorrect import path
- TypeScript: strict mode is intentionally relaxed for faster builds (tsconfig.json)
- ESLint: Some rules are set to warn instead of error for development velocity

Common patterns in this codebase
- Services return ApiResponse<T> with {data?, error?, message?} structure
- All database tables follow snake_case convention
- Components use Turkish naming for user-facing strings
- Forms use React Hook Form with Zod validation
- Loading states typically use loading/error/data pattern from hooks
- Most pages have corresponding service + hook pairs

Windows-specific notes
- Use forward slashes in import paths even on Windows
- npm scripts work with PowerShell and cmd
- If encountering path issues, check that @ alias is resolved correctly
- For file operations in scripts, paths are normalized for Windows compatibility

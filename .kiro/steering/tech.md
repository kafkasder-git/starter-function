# Technology Stack

## Core Technologies

- **React 18.3.1** - UI framework with concurrent features
- **TypeScript 5.9.2** - Strict mode enabled for type safety
- **Vite 7.1.8** - Build tool and dev server
- **Supabase 2.57.4** - Backend-as-a-Service (PostgreSQL, Auth, Storage,
  Real-time)
- **Tailwind CSS 4.0.0** - Utility-first styling
- **Zustand 5.0.3** - Lightweight state management

## Key Libraries

- **Radix UI** - Accessible component primitives (dialogs, dropdowns, selects,
  etc.)
- **TanStack Query 5.59.20** - Data fetching and caching
- **React Hook Form 7.55.0** - Form state management
- **Zod 3.25.76** - Schema validation
- **Recharts 2.15.2** - Charts and data visualization
- **Lucide React** - Icon library
- **Motion (Framer Motion)** - Animations
- **DOMPurify 3.2.6** - XSS protection

## Development Tools

- **ESLint 9.36.0** - Linting with security, React, and TypeScript plugins
- **Prettier 3.6.2** - Code formatting with Tailwind plugin
- **Vitest 3.2.4** - Unit testing
- **Playwright 1.55.1** - E2E testing
- **Husky 9.1.7** - Git hooks
- **lint-staged 16.1.6** - Pre-commit linting

## Common Commands

```bash
# Development
npm run dev              # Start dev server (port 5173)
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests
npm run test:coverage    # Test with coverage
npm run test:e2e         # Run E2E tests with Playwright
npm run test:e2e:ui      # E2E tests with UI

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
npm run type-check:all   # Check all TS configs
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run quality:check    # Run all quality checks
npm run quality:fix      # Fix all quality issues

# Deployment
npm run deploy           # Deploy to Cloudflare
npm run cloudflare:build # Build for Cloudflare
npm run cloudflare:deploy # Deploy to Cloudflare Pages

# Utilities
npm run analyze          # Bundle size analysis
npm run clean            # Clean build artifacts
npm run fresh            # Clean install
```

## Build Configuration

- **Target**: ES2022, ESNext modules
- **Bundler**: Vite with Terser minification
- **Code Splitting**: Manual chunks for vendors (react, ui, supabase, charts,
  forms, utils, icons, motion, query)
- **Source Maps**: Disabled in production
- **Tree Shaking**: Enabled
- **Console Removal**: Automatic in production builds

## Environment Requirements

- Node.js >= 20.0.0
- npm >= 9.0.0
- See `.nvmrc` for exact Node version

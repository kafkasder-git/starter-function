# Technology Stack

## Core Technologies

- **Framework**: React 18.3+ with TypeScript 5.9+
- **Build Tool**: Vite 5.4+ (fast HMR, optimized builds)
- **Backend**: Appwrite 21.2+ (BaaS - authentication, database, storage, functions)
- **Routing**: React Router DOM 6.30+
- **State Management**: Zustand 5.0+ (lightweight, no boilerplate)
- **Forms**: React Hook Form 7.55+ with Zod validation
- **Styling**: Tailwind CSS 4.0+ with custom design tokens
- **UI Components**: Radix UI primitives + custom components
- **Charts**: Recharts 2.15+
- **Icons**: Lucide React

## Development Tools

- **Package Manager**: npm (Node >=22.0.0, npm >=10.0.0)
- **Linting**: ESLint 9+ with TypeScript ESLint, security plugins
- **Formatting**: Prettier 3.6+ with Tailwind plugin
- **Testing**: Vitest 3.2+ (unit), Playwright 1.55+ (e2e)
- **Git Hooks**: Husky 9+ with lint-staged
- **Type Checking**: Strict TypeScript with project references

## Key Libraries

- **Data Fetching**: TanStack Query 5.59+ (caching, background sync)
- **Animations**: Motion 12.0+ (Framer Motion successor)
- **Date Handling**: date-fns 3.6+
- **Security**: DOMPurify, crypto-js, CSRF protection
- **Accessibility**: @axe-core/react, jest-axe
- **PWA**: vite-plugin-pwa with Workbox

## Common Commands

### Development
```bash
npm run dev                    # Start dev server (port 5173)
npm run build                  # Production build
npm run preview                # Preview production build
```

### Code Quality
```bash
npm run lint                   # Lint all files
npm run lint:fix               # Auto-fix linting issues
npm run type-check             # TypeScript type checking
npm run type-check:all         # Check all TS configs
npm run format                 # Format with Prettier
npm run format:check           # Check formatting
npm run quality:check          # Run all checks (lint + types + format)
npm run quality:fix            # Fix all auto-fixable issues
```

### Testing
```bash
npm test                       # Run unit tests (Vitest)
npm run test:coverage          # Run tests with coverage
npm run test:ui                # Open Vitest UI
npm run test:e2e               # Run Playwright e2e tests
npm run test:e2e:ui            # Open Playwright UI
npm run test:e2e:headed        # Run e2e tests in headed mode
```

### Analysis & Optimization
```bash
npm run analyze                # Bundle size analysis
npm run dead-code              # Find unused exports (ts-prune)
npm run unused-deps            # Find unused dependencies (depcheck)
npm run complexity             # Code complexity analysis
npm run lighthouse             # Run Lighthouse audit
```

### Maintenance
```bash
npm run clean                  # Clean build artifacts
npm run fresh                  # Clean install
npm run deps:check             # Check for outdated deps
npm run deps:update            # Update dependencies
npm run deps:audit             # Security audit
```

## Build Configuration

- **Target**: ES2022+ (modern browsers)
- **Code Splitting**: Vendor chunks (react, ui, appwrite, charts, forms, utils, icons)
- **Minification**: Terser with aggressive optimizations
- **Tree Shaking**: Enabled with side-effects tracking
- **Source Maps**: Disabled in production
- **Asset Inlining**: 4KB threshold
- **CSS**: PostCSS with Tailwind, code splitting enabled

## Environment Variables

Required variables (see `.env.example`):
- `VITE_APPWRITE_ENDPOINT` - Appwrite API endpoint
- `VITE_APPWRITE_PROJECT_ID` - Appwrite project ID
- `VITE_APPWRITE_DATABASE_ID` - Appwrite database ID

Optional:
- `VITE_SENTRY_DSN` - Sentry error tracking
- `VITE_ENABLE_OCR` - Enable OCR features
- `VITE_ENABLE_PWA` - Enable PWA features
- `VITE_ENABLE_MOCK_DATA` - Use mock data when offline

## Browser Support

- Modern browsers (ES2022+)
- Production: >0.2%, not dead, not op_mini all
- Development: Latest Chrome, Firefox, Safari

# Technology Stack & Build System

## Core Technologies

### Frontend Framework
- **React 18** - UI framework with concurrent features
- **TypeScript 5.9+** - Strict type checking enabled
- **Vite 7** - Build tool and dev server
- **React Router v6** - Client-side routing with browser history

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework with native format
- **Shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Headless, accessible UI components
- **Lucide React** - Icon library

### State Management
- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management and caching
- **React Hook Form** - Form state management with Zod validation

### Backend & Services
- **Appwrite** - Backend-as-a-Service (BaaS) for auth, database, storage
- **Node Appwrite** - Server-side Appwrite SDK

### Development Tools
- **ESLint 9** - Linting with TypeScript, React, and security rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for pre-commit checks
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Storybook** - Component development and documentation

## Build System

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
npm run test:coverage
npm run test:ui

# End-to-end tests
npm run test:e2e
npm run test:e2e:ui
```

### Code Quality Commands
```bash
# Linting
npm run lint              # Check all files
npm run lint:app          # Check app files only
npm run lint:fix          # Auto-fix issues

# Type checking
npm run type-check        # Check app types
npm run type-check:all    # Check all TypeScript configs

# Formatting
npm run format            # Format all files
npm run format:check      # Check formatting

# Combined quality checks
npm run quality:check     # Lint + type-check + format check
npm run quality:fix       # Auto-fix lint + format
```

### Analysis & Optimization
```bash
# Bundle analysis
npm run analyze
npm run analyze:chunks

# Performance testing
npm run lighthouse
npm run lighthouse:ci

# Code quality analysis
npm run dead-code         # Find unused code
npm run unused-deps       # Find unused dependencies
npm run complexity        # Check code complexity
```

## Project Configuration

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- Path mapping for clean imports (`@/`, `@components/`, etc.)
- Project references for better build performance
- Composite builds for incremental compilation

### Build Optimization
- **Code Splitting** - Automatic chunking by vendor and features
- **Tree Shaking** - Dead code elimination
- **Minification** - Terser with aggressive optimization
- **Asset Optimization** - Image optimization and inlining
- **Bundle Analysis** - Size monitoring and visualization

### Performance Features
- **Lazy Loading** - Route-based and component-based code splitting
- **Memoization** - React.memo, useMemo, useCallback optimizations
- **PWA Features** - Service worker, offline support, caching strategies
- **Bundle Size Limits** - 1MB chunk size warnings

## Environment Requirements

### Node.js & Package Manager
- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- Uses npm for dependency management

### Browser Support
- **Production**: >0.2%, not dead, not op_mini all
- **Development**: Latest Chrome, Firefox, Safari

## Development Workflow

### Git Hooks (Husky)
- **Pre-commit**: ESLint + Prettier on staged files
- **Commit-msg**: Conventional commit format validation

### Code Style
- **ESLint**: TypeScript, React, Security, and Unused imports rules
- **Prettier**: Consistent formatting with Tailwind plugin
- **Import Organization**: Automatic import sorting and cleanup

### Testing Strategy
- **Unit Tests**: Vitest with React Testing Library
- **E2E Tests**: Playwright for critical user flows
- **Coverage**: C8 coverage reporting
- **Accessibility**: Axe-core integration for a11y testing
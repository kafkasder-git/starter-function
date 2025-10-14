# Technology Stack & Build System

## Core Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with optimized bundling
- **Backend**: Appwrite (BaaS) for authentication, database, storage, and functions
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Routing**: React Router v7
- **Charts**: Recharts for data visualization

## Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with Tailwind plugin
- **Testing**: Vitest with Testing Library
- **Git Hooks**: Husky with lint-staged
- **PWA**: Vite PWA plugin for offline capabilities

## Common Commands

### Development
```bash
npm run dev          # Start development server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run format:check # Check formatting
npm run type-check   # TypeScript type checking
```

### Testing
```bash
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## Architecture Patterns
- **Component-based**: Modular React components with clear separation
- **Custom Hooks**: Reusable logic extraction
- **Service Layer**: Centralized API interactions in `/services`
- **Type Safety**: Comprehensive TypeScript coverage
- **Error Boundaries**: Graceful error handling
- **Lazy Loading**: Code splitting for performance
- **PWA**: Offline-first with service workers

## Key Libraries
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Date Handling**: date-fns
- **Utilities**: clsx, tailwind-merge, class-variance-authority
- **Themes**: next-themes for dark/light mode
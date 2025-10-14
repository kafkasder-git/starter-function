# Project Structure & Organization

## Root Level Organization
```
├── components/          # React components (main UI layer)
├── src/                # Application entry points
├── lib/                # Core utilities and configurations
├── services/           # API services and business logic
├── hooks/              # Custom React hooks
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── contexts/           # React context providers
├── utils/              # General utility functions
├── styles/             # Global CSS and styling
├── functions/          # Appwrite cloud functions
├── scripts/            # Build and deployment scripts
└── docs/               # Documentation
```

## Component Architecture
- **components/ui/**: Base UI components (buttons, inputs, etc.)
- **components/shared/**: Reusable components across modules
- **components/pages/**: Page-level components for routes
- **components/forms/**: Form-specific components and validation
- **components/layouts/**: Layout components (header, sidebar, etc.)
- **components/[module]/**: Module-specific components (auth, messaging, etc.)

## Path Aliases (tsconfig.json)
```typescript
"@/*": ["./*"]                    # Root level imports
"@components/*": ["./components/*"] # Component imports
"@lib/*": ["./lib/*"]             # Library imports
"@services/*": ["./services/*"]   # Service imports
"@hooks/*": ["./hooks/*"]         # Hook imports
"@stores/*": ["./stores/*"]       # Store imports
"@types/*": ["./types/*"]         # Type imports
"@utils/*": ["./utils/*"]         # Utility imports
```

## Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `BeneficiaryForm.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useBeneficiaries.ts`)
- **Services**: camelCase ending with "Service" (e.g., `beneficiariesService.ts`)
- **Types**: PascalCase for interfaces/types (e.g., `Beneficiary`, `ApiResponse`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `DATABASE_ID`)

## Module Organization
Each major feature follows this pattern:
- **Page Component**: `components/pages/[Module]Page.tsx`
- **Service**: `services/[module]Service.ts`
- **Types**: `types/[module].ts`
- **Hooks**: `hooks/use[Module].ts`
- **Store**: `stores/[module]Store.ts` (if needed)

## Import Order Convention
1. React and external libraries
2. Internal components (using aliases)
3. Services and utilities
4. Types
5. Relative imports

## File Structure Rules
- **Index files**: Use for clean exports (`components/ui/index.ts`)
- **Test files**: Co-located with source files (`*.test.tsx`)
- **Lazy loading**: Heavy components use `.lazy.tsx` suffix
- **Barrel exports**: Group related exports in index files
- **Single responsibility**: One main export per file

## Configuration Files
- **Vite**: `vite.config.ts` - Build configuration
- **TypeScript**: `tsconfig.json` + project references
- **Tailwind**: `tailwind.config.ts` - Design system tokens
- **ESLint**: `eslint.config.js` - Code quality rules
- **Appwrite**: `appwrite.json` - Backend configuration
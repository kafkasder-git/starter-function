# AI Agent Instructions - Dernek Yönetim Sistemi

## Project Overview

This is a comprehensive **NGO Management System** built with React + TypeScript + Vite + Appwrite. It manages donations, beneficiaries, aid applications, messaging, and financial operations for non-profit organizations.

**Critical**: All communication, comments, variables, and UI text must be in Turkish.

## Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v7
- **Backend**: Appwrite (Database, Auth, Storage, Functions)  
- **UI**: Tailwind CSS, Radix UI, shadcn/ui components
- **State**: Zustand with persist/devtools/immer middleware
- **Forms**: React Hook Form + Zod validation
- **Build**: Vite with advanced chunk splitting and PWA support

## Key Architectural Patterns

### 1. Module-Based Architecture
The app is organized into 10 core modules accessed via `/components/pages/`:
- `genel` (Dashboard) - Statistics and overview
- `yardim` (Aid Management) - Beneficiaries, applications  
- `bagis` (Donations) - Donation tracking, campaigns
- `burs` (Scholarships) - Student management, orphan list
- `fon` (Finance) - Income/expense tracking
- `mesaj` (Messaging) - Internal communication
- `is` (Work Management) - Events, meetings, tasks
- `hukuki` (Legal) - Legal consultations, documents  
- `partner` (Partners) - Partner and donor management
- User/System management

### 2. Routing Strategy
**Dual routing system**: Legacy navigation manager + React Router v7
- New routes in `/src/routes.tsx` map to `/components/pages/`
- Legacy navigation in `/components/app/NavigationManager.tsx`  
- Route configs in `/components/app/AppNavigation.tsx` with lazy loading

### 3. Appwrite Integration
**Centralized in `/lib/`**:
- `/lib/appwrite.ts` - Client initialization with environment validation
- `/lib/database.ts` - Collection IDs and query helpers
- `/lib/collections.ts` - Database schema definitions (currently empty)
- Appwrite Functions in `/functions/` for server-side logic

### 4. State Management Pattern
**Zustand stores in `/stores/`** with consistent structure:
```typescript
// Store pattern: State + Actions interfaces
interface ExampleState {
  items: Example[];
  loading: boolean;
  error: string | null;
}

interface ExampleActions {
  fetchItems: () => Promise<void>;
  addItem: (item: Example) => void;
  updateItem: (id: string, data: Partial<Example>) => void;
}

// Always use immer, devtools, persist middleware
export const useExampleStore = create<ExampleState & ExampleActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Implementation
      })),
      { name: 'example-store' }
    )
  )
);
```

## Development Workflows

### Essential Commands
```bash
# Development with hot reload
npm run dev

# Type checking (run before commits)
npm run type-check

# Linting with auto-fix
npm run lint:fix

# Build with optimization
npm run build

# Testing with coverage
npm run test:coverage

# Console log cleanup for production
npm run cleanup:console:prod
```

### Form Development Pattern
**Always use React Hook Form + Zod**:
```typescript
// 1. Define Zod schema with Turkish messages
const işlemŞeması = z.object({
  ad: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli email adresi giriniz'),
});

type İşlemFormVerisi = z.infer<typeof işlemŞeması>;

// 2. Component with useForm
export function İşlemFormu() {
  const form = useForm<İşlemFormVerisi>({
    resolver: zodResolver(işlemŞeması),
  });

  // 3. Use Form components from /components/ui/form
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="ad"
        render={({ field }) => (
          <FormItem>
            <FormLabel>İsim</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
```

### Component Structure Convention
```typescript
// File: /components/[category]/ComponentName.tsx
/**
 * @fileoverview ComponentName Module - [Category] module
 * @description Component açıklaması Türkçe
 */

// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party imports  
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

// 3. Internal imports with @ alias
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

// 4. Types and interfaces
interface ComponentProps {
  veri: string;
  callback: (sonuç: string) => void;
}

// 5. Component with Turkish JSDoc
/**
 * Component açıklaması
 * 
 * @param veri - Veri açıklaması
 * @param callback - Callback açıklaması
 */
export function ComponentName({ veri, callback }: ComponentProps) {
  // Implementation with Turkish variable names and comments
}
```

## Critical Project-Specific Rules

### Language Requirements
- **All code must use Turkish**: Variable names, comments, console logs, error messages
- **UI text in Turkish**: Form labels, buttons, notifications  
- **English only for**: Technical keywords, library names, file paths

### Appwrite Integration
- Always check `isAppwriteConfigured()` before database operations
- Use centralized error handling with Turkish messages
- Implement offline fallbacks for critical operations
- Collections defined in `/lib/database.ts` - reference before creating new ones

### Performance & Bundle Optimization  
- **Lazy load heavy components** via `/components/LazyComponents.tsx`
- **Chunk splitting configured** in `vite.config.ts` by page modules
- **Use `memo()` for expensive renders**
- **PWA enabled** with service worker caching

### Role-Based Security
```typescript
// Always check permissions before sensitive operations
const { kullanıcı } = useAuthStore();
const yetkiVar = useAuthStore(state => 
  state.hasPermission('beneficiaries:create')
);

// Use permission guards in JSX
<YetkiKoruması yetki="beneficiaries:create">
  <İhtiyaçSahibiFormu />
</YetkiKoruması>
```

### Error Handling Pattern
```typescript
// Standardized error handling with Turkish messages  
try {
  const sonuç = await appwriteOperation();
  toast.success('İşlem başarıyla tamamlandı');
  return sonuç;
} catch (hata) {
  console.error('İşlem sırasında hata:', hata);
  
  if (hata instanceof AppwriteException) {
    toast.error(`Appwrite hatası: ${hata.message}`);
  } else {
    toast.error('Beklenmeyen hata oluştu');
  }
  
  throw hata;
}
```

## Integration Points

### Key External Dependencies
- **Appwrite SDK**: Database, auth, storage operations
- **Radix UI**: Accessible component primitives  
- **Tailwind**: Utility-first styling with custom design tokens
- **Zod**: Runtime type validation for forms and APIs
- **Sonner**: Toast notifications

### Cross-Component Communication
- **Navigation**: Use `useNavigation()` hook from RouterNavigationManager
- **Global state**: Zustand stores with selectors for performance
- **Form state**: React Hook Form with context providers
- **UI state**: Zustand `uiStore` for modals, sidebars, themes

### Critical Files for Context
- `/lib/appwrite.ts` - Appwrite client configuration
- `/stores/authStore.ts` - Authentication and permissions
- `/components/app/AppNavigation.tsx` - Route configuration  
- `/src/routes.tsx` - React Router setup
- `/components/ui/` - Reusable UI components (shadcn/ui)

When working on this codebase, prioritize understanding the Turkish domain terminology, Appwrite integration patterns, and the dual navigation system. Always maintain type safety and follow the established architectural patterns.
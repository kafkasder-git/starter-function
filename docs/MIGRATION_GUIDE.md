# Migration Guide - Frontend Refactoring

## 🎯 Overview

This guide helps you migrate from the old structure to the new organized structure.

## 📁 Directory Changes

### Component Reorganization

| Old Location | New Location | Status |
|-------------|--------------|--------|
| `components/Header.tsx` | `components/layouts/Header.tsx` | ✅ Moved |
| `components/Sidebar.tsx` | `components/layouts/Sidebar.tsx` | ✅ Moved |
| `components/PageLayout.tsx` | `components/layouts/PageLayout.tsx` | ✅ Moved |
| `components/LoadingSpinner.tsx` | `components/shared/LoadingSpinner.tsx` | ✅ Moved |
| `components/SkeletonLoader.tsx` | `components/shared/SkeletonLoader.tsx` | ✅ Moved |
| `components/EmptyState.tsx` | `components/shared/EmptyState.tsx` | ✅ Moved |
| `components/ErrorBoundary.tsx` | `components/shared/ErrorBoundary.tsx` | ✅ Moved |
| `components/AnimatedContainer.tsx` | `components/shared/AnimatedContainer.tsx` | ✅ Moved |
| `components/ResponsiveCard.tsx` | `components/shared/ResponsiveCard.tsx` | ✅ Moved |

## 🔄 Import Path Updates

### Before
```typescript
import { Header } from '../components/Header';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBoundary } from '../components/ErrorBoundary';
```

### After
```typescript
import { Header } from '../components/layouts/Header';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
```

## 🛣️ Routing Changes

### Old Navigation System
```typescript
// Old way - state-based navigation
const { setActiveModule } = useNavigation();
setActiveModule('yardim');
```

### New React Router System
```typescript
// New way - URL-based navigation
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/yardim');

// Or use the compatibility layer
const { setActiveModule } = useNavigation();
setActiveModule('yardim'); // Still works, internally uses React Router
```

## 📝 Type System Updates

### New Type Helpers

```typescript
// Import new type helpers
import type { 
  RequireFields, 
  PartialFields,
  AsyncState,
  PaginatedResponse 
} from '@/types/helpers';

// Use in your components
interface UserData extends RequireFields<BaseUser, 'id' | 'email'> {
  // Additional fields
}

const [state, setState] = useState<AsyncState<UserData>>({
  data: null,
  error: null,
  loading: false,
  status: 'idle'
});
```

### Component Props

```typescript
// Import standard component props
import type { 
  BaseComponentProps,
  ButtonProps,
  TableProps 
} from '@/types/components';

// Extend for your component
interface MyComponentProps extends BaseComponentProps {
  customProp: string;
}
```

## 🎨 Styling Updates

### CSS Consolidation

**Before:**
- Multiple CSS files (`index.css`, `globals.css`)
- Inconsistent theme variables

**After:**
- Single source: `index.css`
- Tailwind v4 native format
- Consistent theme variables

### Usage
```typescript
// No changes needed in component code
// All Tailwind classes work the same
<div className="flex items-center gap-4 p-4">
```

## 🧪 Testing Updates

### Import Paths
Update test imports to match new structure:

```typescript
// Before
import { LoadingSpinner } from '../LoadingSpinner';

// After
import { LoadingSpinner } from '../shared/LoadingSpinner';
```

## 🚀 Step-by-Step Migration

### For Existing Components

1. **Update Imports**
   ```bash
   # Run the import update script
   bash scripts/update-imports.sh
   ```

2. **Check TypeScript Errors**
   ```bash
   npm run type-check
   ```

3. **Update Tests**
   - Update import paths in test files
   - Run tests: `npm test`

4. **Update Routing (if applicable)**
   - Replace state-based navigation with React Router
   - Update route definitions in `src/routes.tsx`

### For New Components

1. **Choose Correct Location**
   - UI components → `components/ui/`
   - Layout components → `components/layouts/`
   - Shared components → `components/shared/`
   - Feature components → `components/features/{feature}/`
   - Page components → `components/pages/`

2. **Use Component Template**
   - Copy from `docs/COMPONENT_GUIDELINES.md`
   - Follow naming conventions
   - Add proper TypeScript types

3. **Add Tests**
   - Create `ComponentName.test.tsx`
   - Follow testing guidelines

## ⚠️ Breaking Changes

### 1. Import Paths
All moved components require updated import paths.

**Action Required:** Run `bash scripts/update-imports.sh`

### 2. Navigation System
State-based navigation is deprecated (but still works).

**Action Required:** Gradually migrate to React Router

### 3. CSS Variables
Some legacy CSS variables removed.

**Action Required:** Use Tailwind v4 theme variables

## 🔧 Troubleshooting

### Import Errors

**Problem:** `Cannot find module '../components/Header'`

**Solution:** Update import path to `'../components/layouts/Header'`

### Type Errors

**Problem:** `Property 'X' does not exist on type 'Y'`

**Solution:** 
1. Check if using correct type from `@/types/`
2. Ensure type definitions are up to date
3. Run `npm run type-check` for details

### Routing Issues

**Problem:** Navigation not working

**Solution:**
1. Ensure `BrowserRouter` is wrapping your app
2. Check route definitions in `src/routes.tsx`
3. Verify `RouterNavigationProvider` is used

## 📚 Additional Resources

- [Component Guidelines](./COMPONENT_GUIDELINES.md)
- [Frontend Improvements](../FRONTEND_IMPROVEMENTS.md)
- [Implementation Summary](../IMPLEMENTATION_SUMMARY.md)

## ✅ Migration Checklist

- [ ] Run import update script
- [ ] Fix TypeScript errors
- [ ] Update test imports
- [ ] Migrate to React Router (gradual)
- [ ] Update documentation
- [ ] Review and test all features
- [ ] Remove deprecated code

## 🆘 Need Help?

If you encounter issues during migration:

1. Check this guide first
2. Review error messages carefully
3. Check related documentation
4. Ask the team for help

## 📊 Progress Tracking

Track your migration progress:

- [ ] Component reorganization complete
- [ ] Import paths updated
- [ ] TypeScript errors fixed
- [ ] Tests passing
- [ ] Routing migrated
- [ ] Documentation updated
- [ ] Code review completed
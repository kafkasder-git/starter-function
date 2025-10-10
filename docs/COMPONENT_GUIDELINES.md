# Component Development Guidelines

## 📁 Component Organization

### Directory Structure

```
components/
├── ui/                    # Shadcn and base UI components
├── layouts/               # Layout components (Header, Sidebar, etc.)
├── shared/                # Shared/common components
├── features/              # Feature-specific components
│   ├── auth/             # Authentication features
│   ├── beneficiaries/    # Beneficiary management
│   ├── donations/        # Donation management
│   └── ...
└── pages/                 # Page-level components
```

## 🎯 Component Template

### Functional Component Template

```typescript
/**
 * @fileoverview ComponentName - Brief description
 * @description Detailed description of what this component does
 * @version 1.0.0
 */

import React, { memo } from 'react';
import { cn } from '@/components/ui/utils';
import type { BaseComponentProps } from '@/types/components';

/**
 * Props interface for ComponentName
 */
export interface ComponentNameProps extends BaseComponentProps {
  /**
   * Prop description
   */
  propName: string;
  
  /**
   * Optional prop description
   */
  optionalProp?: number;
  
  /**
   * Callback description
   */
  onAction?: (value: string) => void;
}

/**
 * ComponentName Component
 * 
 * @example
 * ```tsx
 * <ComponentName propName="value" onAction={handleAction} />
 * ```
 */
export const ComponentName = memo<ComponentNameProps>(({
  propName,
  optionalProp = 0,
  onAction,
  className,
  children,
  testId = 'component-name',
}) => {
  // Component logic here
  
  return (
    <div 
      className={cn('base-classes', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';

export default ComponentName;
```

## 📝 Naming Conventions

### Component Names
- **PascalCase** for component names: `UserProfile`, `DataTable`
- **Descriptive** and **specific**: `BeneficiaryList` not `List`
- **Suffix** with component type when needed: `UserCard`, `ProfileModal`

### File Names
- Match component name: `UserProfile.tsx`
- Test files: `UserProfile.test.tsx`
- Story files: `UserProfile.stories.tsx`

### Props Interface
- Name: `ComponentNameProps`
- Extend base props when applicable: `extends BaseComponentProps`
- Document each prop with JSDoc comments

## 🎨 Styling Guidelines

### Tailwind CSS
```typescript
// ✅ Good - Use Tailwind utilities
<div className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-sm">

// ❌ Bad - Avoid inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Class Merging
```typescript
import { cn } from '@/components/ui/utils';

// ✅ Good - Use cn() for conditional classes
<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}>

// ❌ Bad - String concatenation
<div className={`base-class ${isActive ? 'active-class' : ''} ${className}`}>
```

## 🔧 TypeScript Best Practices

### Type Safety
```typescript
// ✅ Good - Explicit types
interface UserData {
  id: string;
  name: string;
  email: string;
}

const user: UserData = { ... };

// ❌ Bad - Using any
const user: any = { ... };
```

### Props Destructuring
```typescript
// ✅ Good - Destructure with defaults
const Component = ({ 
  title, 
  count = 0, 
  onAction 
}: ComponentProps) => {

// ❌ Bad - Accessing via props object
const Component = (props: ComponentProps) => {
  return <div>{props.title}</div>;
```

## 🎭 Component Patterns

### Compound Components
```typescript
export const Card = ({ children }: PropsWithChildren) => (
  <div className="card">{children}</div>
);

Card.Header = ({ children }: PropsWithChildren) => (
  <div className="card-header">{children}</div>
);

Card.Body = ({ children }: PropsWithChildren) => (
  <div className="card-body">{children}</div>
);

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### Render Props
```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T, loading: boolean) => ReactNode;
}

const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const { data, loading } = useFetch<T>(url);
  return <>{children(data, loading)}</>;
};
```

### Custom Hooks
```typescript
/**
 * Custom hook for managing form state
 */
export const useFormState = <T extends Record<string, any>>(
  initialValues: T
) => {
  const [values, setValues] = useState<T>(initialValues);
  
  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };
  
  return { values, handleChange };
};
```

## ♿ Accessibility

### ARIA Attributes
```typescript
// ✅ Good - Proper ARIA labels
<button 
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={handleClose}
>
  <CloseIcon />
</button>

// ❌ Bad - Missing accessibility
<button onClick={handleClose}>
  <CloseIcon />
</button>
```

### Keyboard Navigation
```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
};

<div 
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  onClick={handleAction}
>
```

## 🧪 Testing

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName propName="test" />);
    expect(screen.getByTestId('component-name')).toBeInTheDocument();
  });
  
  it('handles user interaction', () => {
    const handleAction = jest.fn();
    render(<ComponentName propName="test" onAction={handleAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleAction).toHaveBeenCalledWith('test');
  });
});
```

## 📦 Exports

### Named Exports (Preferred)
```typescript
// ✅ Good - Named export
export const Button = ({ ... }) => { ... };

// Usage
import { Button } from '@/components/ui/button';
```

### Default Exports (When Necessary)
```typescript
// Use for page components or single-export files
export default function HomePage() { ... }
```

## 🚀 Performance

### Memoization
```typescript
// ✅ Good - Memo for expensive components
export const ExpensiveComponent = memo(({ data }: Props) => {
  // Expensive rendering logic
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id;
});

// ✅ Good - useMemo for expensive calculations
const sortedData = useMemo(
  () => data.sort((a, b) => a.value - b.value),
  [data]
);

// ✅ Good - useCallback for event handlers
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Lazy Loading
```typescript
// ✅ Good - Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<LoadingSpinner />}>
  <HeavyComponent />
</Suspense>
```

## 📚 Documentation

### JSDoc Comments
```typescript
/**
 * Formats a date string to a localized format
 * 
 * @param date - The date to format
 * @param locale - The locale to use (default: 'tr-TR')
 * @returns Formatted date string
 * 
 * @example
 * ```ts
 * formatDate(new Date(), 'en-US') // "12/31/2024"
 * ```
 */
export const formatDate = (
  date: Date, 
  locale: string = 'tr-TR'
): string => {
  return date.toLocaleDateString(locale);
};
```

## ✅ Checklist

Before submitting a component:

- [ ] Component follows naming conventions
- [ ] Props are properly typed with interface
- [ ] JSDoc comments added
- [ ] Accessibility attributes included
- [ ] Responsive design implemented
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Tests written
- [ ] Memoization applied where needed
- [ ] No console.logs or debugger statements
- [ ] No `any` types used
- [ ] Imports organized and clean

## 🔗 Related Documentation

- [TypeScript Guidelines](./TYPESCRIPT_GUIDELINES.md)
- [Testing Guidelines](./TESTING_GUIDELINES.md)
- [Accessibility Guidelines](./ACCESSIBILITY_GUIDELINES.md)
- [Performance Guidelines](./PERFORMANCE_GUIDELINES.md)
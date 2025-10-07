# 🧪 Testing Guide

Comprehensive testing guide for Kafkasder Management System.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [E2E Testing](#e2e-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Accessibility Testing](#accessibility-testing)

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\
     /      \    Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /__________  \
```

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths
- **E2E Tests**: User journeys
- **Performance**: Core Web Vitals
- **Security**: OWASP Top 10
- **Accessibility**: WCAG 2.1 AA

---

## Unit Testing

### Setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

### Writing Unit Tests

#### Component Test Example

```typescript
// components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../ui/button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

#### Service Test Example

```typescript
// services/__tests__/userService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '../userService';

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user by id', async () => {
    const user = await userService.getUser('123');
    
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });

  it('throws error for invalid user', async () => {
    await expect(userService.getUser('invalid')).rejects.toThrow();
  });
});
```

#### Hook Test Example

```typescript
// hooks/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAuth } from '../useAuth';

describe('useAuth Hook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('logs in user', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });
    
    expect(result.current.user).toBeDefined();
  });
});
```

---

## Integration Testing

### Database Integration

```typescript
// tests/integration/database.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../../lib/supabase';

describe('Database Integration', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    // Cleanup test data
  });

  it('creates and retrieves member', async () => {
    const { data, error } = await supabase
      .from('members')
      .insert({
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.first_name).toBe('Test');
  });
});
```

### API Integration

```typescript
// tests/integration/api.test.ts
import { describe, it, expect } from 'vitest';
import { membersService } from '../../services/membersService';

describe('Members API Integration', () => {
  it('fetches members list', async () => {
    const result = await membersService.getMembers();
    
    expect(result.data).toBeInstanceOf(Array);
    expect(result.error).toBeNull();
  });

  it('creates new member', async () => {
    const memberData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    };

    const result = await membersService.createMember(memberData);
    
    expect(result.data).toBeDefined();
    expect(result.data.first_name).toBe('John');
  });
});
```

---

## E2E Testing

### Setup Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Run specific test
npx playwright test tests/e2e/login.spec.ts

# Generate report
npm run test:e2e:report
```

### Writing E2E Tests

#### Login Flow

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful login', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('failed login shows error', async ({ page }) => {
    await page.goto('/');
    
    await page.fill
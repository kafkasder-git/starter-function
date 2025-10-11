# Automated Testing Plan for UI/UX Improvements

## Overview

This document outlines the automated testing strategy to verify and maintain UI/UX improvements across the application.

---

## 1. Design Token Compliance Tests

### Grep-Based Checks (CI/CD Integration)

**Script: `scripts/verify-design-tokens.sh`**

Create a shell script that runs in CI/CD pipeline:

```bash
#!/bin/bash
# Verify no hardcoded colors in production components

echo "Checking for hardcoded colors..."
HARDCODED_COLORS=$(grep -r "text-gray-\|bg-gray-\|text-blue-\|bg-blue-\|text-red-\|bg-red-\|text-green-\|bg-green-" \
  components/ \
  --include="*.tsx" \
  --include="*.ts" \
  --exclude-dir=examples \
  --exclude-dir=__tests__ \
  | grep -v "// Legacy" \
  | grep -v "// Deprecated")

if [ -n "$HARDCODED_COLORS" ]; then
  echo "❌ Found hardcoded colors:"
  echo "$HARDCODED_COLORS"
  exit 1
else
  echo "✅ No hardcoded colors found"
fi

echo "Checking for hardcoded font sizes..."
HARDCODED_FONTS=$(grep -r "text-xs\|text-sm\|text-lg\|text-2xl\|text-3xl" \
  components/ \
  --include="*.tsx" \
  --exclude="variants.ts" \
  --exclude="tokens.ts" \
  --exclude-dir=examples \
  | grep -v "Heading" \
  | grep -v "Text")

if [ -n "$HARDCODED_FONTS" ]; then
  echo "⚠️  Found hardcoded font sizes (review needed):"
  echo "$HARDCODED_FONTS"
  # Don't fail, just warn
else
  echo "✅ No hardcoded font sizes found"
fi

exit 0
```

**Integration:**
- Add to package.json: `"verify:tokens": "bash scripts/verify-design-tokens.sh"`
- Add to CI/CD pipeline before deployment
- Run on pre-commit hook (optional)

---

## 2. Accessibility Tests (Lighthouse CI)

### Lighthouse CI Configuration

**File: `.lighthouserc.json`** (already exists, verify configuration)

Ensure configuration includes:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/beneficiaries",
        "http://localhost:3000/donations",
        "http://localhost:3000/aid"
      ]
    },
    "assert": {
      "assertions": {
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:performance": ["warn", {"minScore": 0.90}],
        "categories:best-practices": ["warn", {"minScore": 0.90}]
      }
    }
  }
}
```

**Integration:**
- Add to package.json: `"test:lighthouse": "lhci autorun"`
- Run in CI/CD after build
- Generate reports for review

### Axe-Core Accessibility Tests

**File: `tests/accessibility/axe-setup.ts`** (already exists)

Verify axe-core is configured to test:
- Color contrast (WCAG AA)
- ARIA attributes
- Keyboard navigation
- Form labels
- Image alt text

**Integration:**
- Add to package.json: `"test:a11y": "vitest run tests/accessibility/"`
- Run in CI/CD pipeline
- Fail build if critical issues found

---

## 3. Visual Regression Tests (Playwright)

### Playwright Configuration

**File: `playwright.config.ts`** (already exists)

Add visual regression tests for key components:

**Test: `tests/visual/components.spec.ts`**

Create tests that capture screenshots:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test('Button variants', async ({ page }) => {
    await page.goto('/components/button-examples');
    await expect(page).toHaveScreenshot('button-variants.png');
  });

  test('Card variants', async ({ page }) => {
    await page.goto('/components/card-examples');
    await expect(page).toHaveScreenshot('card-variants.png');
  });

  test('Form validation states', async ({ page }) => {
    await page.goto('/components/form-examples');
    // Trigger validation
    await page.click('button[type="submit"]');
    await expect(page).toHaveScreenshot('form-validation.png');
  });

  test('Status badges', async ({ page }) => {
    await page.goto('/components/badge-examples');
    await expect(page).toHaveScreenshot('status-badges.png');
  });
});
```

**Integration:**
- Add to package.json: `"test:visual": "playwright test tests/visual/"`
- Run in CI/CD with baseline comparison
- Update baselines when design changes intentionally

---

## 4. Mobile Responsiveness Tests (Playwright)

### Responsive Testing

**Test: `tests/e2e/responsive.spec.ts`**

Create tests for different viewport sizes:

```typescript
import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'iPhone SE', ...devices['iPhone SE'] },
  { name: 'iPad', ...devices['iPad'] },
  { name: 'Desktop', viewport: { width: 1280, height: 720 } },
];

viewports.forEach(({ name, ...device }) => {
  test.describe(`Responsive: ${name}`, () => {
    test.use(device);

    test('Beneficiaries page responsive', async ({ page }) => {
      await page.goto('/beneficiaries');

      // Verify table/card transformation
      if (name === 'iPhone SE') {
        await expect(page.locator('[data-slot="card"]')).toBeVisible();
        await expect(page.locator('table')).not.toBeVisible();
      } else {
        await expect(page.locator('table')).toBeVisible();
      }
    });

    test('Touch targets meet 44px minimum', async ({ page }) => {
      await page.goto('/beneficiaries');

      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const box = await buttons.nth(i).boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(box.width).toBeGreaterThanOrEqual(44);
        }
      }
    });
  });
});
```

**Integration:**
- Add to package.json: `"test:responsive": "playwright test tests/e2e/responsive.spec.ts"`
- Run in CI/CD with multiple viewports
- Generate reports with screenshots

---

## 5. Form Validation Tests (Vitest + React Testing Library)

### Unit Tests for Form Components

**Test: `components/forms/__tests__/FormField.test.tsx`**

Create comprehensive tests:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormField } from '../FormField';

test('shows inline error on validation failure', async () => {
  const { container } = render(
    <FormField
      id="email"
      name="email"
      label="Email"
      type="email"
      errors={[{ field: 'email', message: 'Invalid email', code: 'INVALID_EMAIL' }]}
      touched={true}
    />
  );

  expect(screen.getByText('Invalid email')).toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

test('shows success icon on valid input', async () => {
  const { container } = render(
    <FormField
      id="email"
      name="email"
      label="Email"
      type="email"
      value="test@example.com"
      touched={true}
      showValidationIcon={true}
    />
  );

  expect(container.querySelector('[data-icon="check-circle"]')).toBeInTheDocument();
});

test('async validation shows loading spinner', async () => {
  const asyncValidator = jest.fn().mockResolvedValue(null);

  const { container } = render(
    <FormField
      id="username"
      name="username"
      label="Username"
      asyncValidator={asyncValidator}
      value="testuser"
    />
  );

  await waitFor(() => {
    expect(container.querySelector('[data-icon="loader"]')).toBeInTheDocument();
  });
});
```

**Integration:**
- Add to package.json: `"test:forms": "vitest run components/forms/__tests__/"`
- Run in CI/CD pipeline
- Maintain high code coverage (>80%)

---

## 6. Date Formatting Tests (Vitest)

### Unit Tests for Date Utilities

**Test: `lib/utils/__tests__/dateFormatter.test.ts`**

Create tests for Turkish locale:

```typescript
import { formatDate, formatTime, formatRelativeTime, validateDateRange } from '../dateFormatter';

test('formats date in Turkish format', () => {
  const date = new Date('2024-01-15T14:30:00');
  expect(formatDate(date)).toBe('15.01.2024');
});

test('formats time in 24-hour format', () => {
  const date = new Date('2024-01-15T14:30:00');
  expect(formatTime(date)).toBe('14:30');
});

test('formats relative time in Turkish', () => {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  expect(formatRelativeTime(twoHoursAgo)).toContain('saat önce');
});

test('validates date range correctly', () => {
  const start = new Date('2024-01-01');
  const end = new Date('2024-01-31');

  const result = validateDateRange(start, end);
  expect(result.valid).toBe(true);
});

test('rejects invalid date range', () => {
  const start = new Date('2024-01-31');
  const end = new Date('2024-01-01');

  const result = validateDateRange(start, end);
  expect(result.valid).toBe(false);
  expect(result.error).toContain('Başlangıç tarihi');
});
```

**Integration:**
- Add to package.json: `"test:dates": "vitest run lib/utils/__tests__/dateFormatter.test.ts"`
- Run in CI/CD pipeline
- Ensure Turkish locale is available in test environment

---

## 7. Icon Consistency Tests (Grep + Manual)

### Automated Icon Audit

**Script: `scripts/verify-icon-consistency.sh`**

```bash
#!/bin/bash
# Verify icon consistency across pages

echo "Checking for inconsistent edit icons..."
EDIT_ICONS=$(grep -r "<Edit\|<Edit2\|<Edit3" components/pages/ --include="*.tsx")

if [ -n "$EDIT_ICONS" ]; then
  echo "⚠️  Found inconsistent edit icons (should use Pencil):"
  echo "$EDIT_ICONS"
fi

echo "Checking for inconsistent delete icons..."
DELETE_ICONS=$(grep -r "<Trash[^2]" components/pages/ --include="*.tsx")

if [ -n "$DELETE_ICONS" ]; then
  echo "⚠️  Found inconsistent delete icons (should use Trash2):"
  echo "$DELETE_ICONS"
fi

echo "Checking for StatusBadge usage..."
STATUS_DISPLAYS=$(grep -r "status.*Badge\|getStatusBadge" components/pages/ --include="*.tsx" | grep -v "StatusBadge")

if [ -n "$STATUS_DISPLAYS" ]; then
  echo "⚠️  Found status displays not using StatusBadge:"
  echo "$STATUS_DISPLAYS"
fi

exit 0
```

**Integration:**
- Add to package.json: `"verify:icons": "bash scripts/verify-icon-consistency.sh"`
- Run in CI/CD as warning (don't fail build)
- Review output manually

---

## 8. Typography Hierarchy Tests (Playwright)

### Heading Structure Tests

**Test: `tests/e2e/typography.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

const pages = [
  { url: '/', name: 'Dashboard' },
  { url: '/beneficiaries', name: 'Beneficiaries' },
  { url: '/donations', name: 'Donations' },
  { url: '/aid', name: 'Aid Requests' },
];

pages.forEach(({ url, name }) => {
  test(`${name} has proper heading hierarchy`, async ({ page }) => {
    await page.goto(url);

    // Check for single H1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check heading order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const levels = await Promise.all(
      headings.map(h => h.evaluate(el => parseInt(el.tagName[1])))
    );

    // Verify no skipped levels
    for (let i = 1; i < levels.length; i++) {
      const diff = levels[i] - levels[i - 1];
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
});
```

**Integration:**
- Add to package.json: `"test:typography": "playwright test tests/e2e/typography.spec.ts"`
- Run in CI/CD pipeline
- Fail build if heading hierarchy is broken

---

## 9. CI/CD Pipeline Integration

### GitHub Actions Workflow

**File: `.github/workflows/ui-ux-tests.yml`**

Create comprehensive CI/CD workflow:

```yaml
name: UI/UX Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  design-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify Design Tokens
        run: npm run verify:tokens

  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Run Lighthouse CI
        run: npm run test:lighthouse
      - name: Run Axe Tests
        run: npm run test:a11y

  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Visual Tests
        run: npm run test:visual
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-diffs
          path: test-results/

  responsive:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Responsive Tests
        run: npm run test:responsive

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run Form Tests
        run: npm run test:forms
      - name: Run Date Tests
        run: npm run test:dates
      - name: Upload Coverage
        uses: codecov/codecov-action@v3

  icon-consistency:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Verify Icon Consistency
        run: npm run verify:icons
        continue-on-error: true

  typography:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run Typography Tests
        run: npm run test:typography
```

---

## 10. Monitoring & Alerts

### Production Monitoring

**Setup:**
1. **Sentry** - Error tracking and performance monitoring
2. **Google Analytics** - User behavior tracking
3. **Lighthouse CI Server** - Continuous performance monitoring
4. **Datadog RUM** - Real user monitoring

**Alerts:**
- Accessibility score drops below 95
- Performance score drops below 90
- Error rate increases above threshold
- User complaints about mobile usability

---

## Summary

### Test Coverage Matrix

| Phase | Automated Tests | Manual Tests | CI/CD Integration |
|-------|----------------|--------------|-------------------|
| Design Tokens | ✅ Grep checks | ⚠️ Spot checks | ✅ Pre-commit |
| Mobile Responsive | ✅ Playwright | ✅ Device testing | ✅ CI/CD |
| Accessibility | ✅ Lighthouse + Axe | ✅ Screen reader | ✅ CI/CD |
| Form Validation | ✅ Vitest + RTL | ✅ User testing | ✅ CI/CD |
| Date Formatting | ✅ Vitest | ✅ Visual check | ✅ CI/CD |
| Icon Consistency | ⚠️ Grep checks | ✅ Visual audit | ⚠️ Warning only |
| Typography | ✅ Playwright | ✅ Visual check | ✅ CI/CD |
| Loading States | ✅ Visual regression | ✅ User testing | ✅ CI/CD |

### Next Steps

1. Implement all automated tests
2. Integrate into CI/CD pipeline
3. Run initial baseline tests
4. Fix any failing tests
5. Enable required checks for PRs
6. Set up monitoring and alerts
7. Schedule regular manual testing
8. Document test maintenance procedures


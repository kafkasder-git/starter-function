import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Kafkasder|Dernek Yönetim/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();
    
    // Check for validation messages
    await expect(page.locator('text=/email|e-posta/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Wait for error message
    await expect(page.locator('text=/hata|error|geçersiz|invalid/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Use test credentials from environment or defaults
    const email = process.env.TEST_USER_EMAIL || 'admin@kafkasder.com';
    const password = process.env.TEST_USER_PASSWORD || 'Admin123!';

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/dashboard|genel/i, { timeout: 10000 });
    
    // Verify dashboard elements
    await expect(page.locator('text=/dashboard|panel|ana sayfa/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    const email = process.env.TEST_USER_EMAIL || 'admin@kafkasder.com';
    const password = process.env.TEST_USER_PASSWORD || 'Admin123!';

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|genel/i);

    // Find and click logout button
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("Profil")');
    await userMenu.click();
    
    const logoutButton = page.locator('text=/çıkış|logout/i');
    await logoutButton.click();

    // Verify redirect to login
    await page.waitForURL(/login|giris/i, { timeout: 5000 });
  });
});

import { test, expect } from '@playwright/test';

test('TC001: Successful login with valid credentials', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:5173');
  
  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');
  
  // Input valid username/email and password
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email"]').first();
  await emailInput.fill('isahamid095@gmail.com');
  
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i], input[placeholder*="Password"]').first();
  await passwordInput.fill('Vadalov95.');
  
  // Click login button
  const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Giriş"), button:has-text("Giriş Yap")').first();
  await loginButton.click();
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard**', { timeout: 10000 });
  
  // Verify dashboard elements
  await expect(page.locator('text=Dernek Yönetim Sistemi').first()).toBeVisible();
  await expect(page.locator('text=Dernek yönetim sistemi - Güncel durum özeti').first()).toBeVisible();
  
  // Verify some dashboard metrics are visible (these might need adjustment based on actual content)
  // await expect(page.locator('text=₺8000').first()).toBeVisible();
  // await expect(page.locator('text=68').first()).toBeVisible();
});

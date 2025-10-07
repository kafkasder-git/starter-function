import { test, expect } from '@playwright/test';

test.describe('Members Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    const email = process.env.TEST_USER_EMAIL || 'admin@kafkasder.com';
    const password = process.env.TEST_USER_PASSWORD || 'Admin123!';
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|genel/i);
  });

  test('should navigate to members page', async ({ page }) => {
    // Click on members menu item
    await page.click('text=/üye|member/i');
    
    // Verify members page loaded
    await expect(page.locator('text=/üye listesi|member list/i')).toBeVisible();
  });

  test('should display members list', async ({ page }) => {
    await page.click('text=/üye|member/i');
    
    // Wait for table or list to load
    await page.waitForSelector('table, [role="table"], [data-testid="members-list"]', {
      timeout: 10000,
    });
    
    // Verify table headers
    await expect(page.locator('text=/ad|name/i')).toBeVisible();
    await expect(page.locator('text=/soyad|surname/i')).toBeVisible();
  });

  test('should search members', async ({ page }) => {
    await page.click('text=/üye|member/i');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Ara"], input[type="search"]');
    await searchInput.fill('Ahmet');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const rows = page.locator('table tbody tr, [role="row"]');
    await expect(rows.first()).toContainText(/ahmet/i);
  });

  test('should open add member form', async ({ page }) => {
    await page.click('text=/üye|member/i');
    
    // Click add button
    await page.click('button:has-text("Yeni"), button:has-text("Ekle")');
    
    // Verify form opened
    await expect(page.locator('text=/üye ekle|add member/i')).toBeVisible();
    await expect(page.locator('input[name="first_name"], input[name="firstName"]')).toBeVisible();
  });

  test('should validate required fields in add form', async ({ page }) => {
    await page.click('text=/üye|member/i');
    await page.click('button:has-text("Yeni"), button:has-text("Ekle")');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    await expect(page.locator('text=/zorunlu|required/i')).toBeVisible();
  });

  test('should filter members by status', async ({ page }) => {
    await page.click('text=/üye|member/i');
    
    // Find and click filter button
    const filterButton = page.locator('button:has-text("Filtre"), [data-testid="filter-button"]');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Select active status
      await page.click('text=/aktif|active/i');
      
      // Verify filtered results
      await page.waitForTimeout(1000);
      const statusCells = page.locator('td:has-text("Aktif"), [data-status="active"]');
      await expect(statusCells.first()).toBeVisible();
    }
  });

  test('should export members list', async ({ page }) => {
    await page.click('text=/üye|member/i');
    
    // Find export button
    const exportButton = page.locator('button:has-text("Dışa Aktar"), button:has-text("Export")');
    
    if (await exportButton.isVisible()) {
      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download
      expect(download.suggestedFilename()).toMatch(/members|uyeler/i);
    }
  });
});

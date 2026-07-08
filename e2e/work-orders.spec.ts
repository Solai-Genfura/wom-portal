import { test, expect } from '@playwright/test';

test.describe('FixFlow Work Orders E2E Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Reset/seed the database before E2E tests if necessary,
    // but here we just go to the dashboard home page.
    await page.goto('/');
  });

  test('should display dashboard with work orders and allow filtering', async ({ page }) => {
    // 1. Check title
    await expect(page.locator('h1')).toContainText('Technician Dashboard');
    
    // 2. Perform text search
    const searchInput = page.locator('#search-input');
    await searchInput.fill('fluorescent');
    
    // Wait for debounce and filter results
    await page.waitForTimeout(600);
    
    // Check that table rows or cards filtered down (should see "Replace Lobby Fluorescent Tube Lights")
    await expect(page.locator('text=Fluorescent').first()).toBeVisible();
    await expect(page.locator('text=Power Outlet').first()).not.toBeVisible();

    // 3. Clear filters
    const clearButton = page.locator('button:has-text("Clear filters")');
    await clearButton.click();
    await expect(searchInput).toHaveValue('');
    await expect(clearButton).not.toBeVisible(); // Wait for clear filters transition to complete
    
    // 4. Filter by status
    const statusSelect = page.locator('#status-filter');
    await expect(statusSelect).toBeEnabled();
    await statusSelect.selectOption('Done');
    await expect(page).toHaveURL(/status=Done/);
    
    // Only "Done" orders should be visible in the table
    await expect(page.locator('text=Done').first()).toBeVisible();
    await expect(page.locator('table').locator('text=Open').first()).not.toBeVisible();
  });

  test('should support creating, viewing, editing, and deleting a work order', async ({ page }) => {
    // --- 1. CREATION FLOW ---
    // Navigate to new order page
    await page.click('#dashboard-new-order-button');
    await expect(page).toHaveURL('/new');

    const titleInput = page.locator('#title');
    const descInput = page.locator('#description');
    const prioritySelect = page.locator('#priority');
    const submitButton = page.locator('button[type="submit"]');

    // Trigger validation
    await titleInput.fill('A');
    await submitButton.click();
    await expect(page.locator('#title-error')).toContainText('Title must be at least 2 characters');

    // Fill valid data
    const uniqueTitle = `E2E Test Order - ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    await descInput.fill('This description was created automatically by Playwright E2E tests.');
    await prioritySelect.selectOption('High');
    await submitButton.click();

    // After submission, it should redirect back to dashboard
    await expect(page).toHaveURL('/');
    
    // The newly created work order should be visible on the dashboard
    const newOrderLink = page.locator(`a:has-text("${uniqueTitle}")`).first();
    await expect(newOrderLink).toBeVisible();

    // --- 2. DETAILS VIEW FLOW ---
    // Click on the title link to view details
    await newOrderLink.click();
    await expect(page).toHaveURL(/\/([0-9a-fA-F-]+)$/); // UUID URL
    
    await expect(page.locator('h1')).toContainText(uniqueTitle);
    await expect(page.locator('text=High Priority').first()).toBeVisible();
    await expect(page.locator('text=Open').first()).toBeVisible();
    await expect(page.locator('text=This description was created automatically').first()).toBeVisible();

    // --- 3. EDIT FLOW ---
    // Click edit order
    await page.click('a:has-text("Edit Order")');
    await expect(page).toHaveURL(/\/edit$/);

    // Modify fields
    await page.locator('#priority').selectOption('Medium');
    await page.locator('#status').selectOption('In Progress');
    await page.click('button[type="submit"]');

    // Redirected back to details page
    await expect(page).toHaveURL(/\/([0-9a-fA-F-]+)$/);
    await expect(page.locator('text=Medium Priority').first()).toBeVisible();
    await expect(page.locator('text=In Progress').first()).toBeVisible();

    // Settle pending transitions/RSC re-validation before deleting
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // --- 4. DELETE FLOW ---
    // Intercept confirm dialog and accept it
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete');
      await dialog.accept();
    });

    // Click delete order
    await page.click('button[title="Delete Work Order"]');

    // Should redirect to dashboard home
    await expect(page).toHaveURL('/');
    
    // Verify deleted order is no longer present
    await expect(page.locator(`a:has-text("${uniqueTitle}")`).first()).not.toBeVisible();
  });
});

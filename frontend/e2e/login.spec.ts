import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3003/login');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForLoadState('networkidle');

    expect(consoleErrors.length).toBe(0);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  });

  test('should login with typed admin credentials (normal case)', async ({ page }) => {
    // Type character by character (not fill)
    await page.type('input[name="email"]', 'admin@athena.demo');
    await page.type('input#password', 'Admin@123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if error appeared
    const errorDiv = page.locator('.bg-red-50');
    const hasError = await errorDiv.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    expect(hasError).toBe(false);
  });

  test('should login with mixed-case email', async ({ page }) => {
    // Type with capital letters
    await page.type('input[name="email"]', 'Admin@athena.demo');
    await page.type('input#password', 'Admin@123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if error appeared
    const errorDiv = page.locator('.bg-red-50');
    const hasError = await errorDiv.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    expect(hasError).toBe(false);
  });

  test('should login with trailing space in email', async ({ page }) => {
    // Type with trailing space
    await page.type('input[name="email"]', 'admin@athena.demo ');
    await page.type('input#password', 'Admin@123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if error appeared
    const errorDiv = page.locator('.bg-red-50');
    const hasError = await errorDiv.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    expect(hasError).toBe(false);
  });

  test('should login with password containing special characters', async ({ page }) => {
    // Exact password with special characters
    await page.type('input[name="email"]', 'admin@athena.demo');
    await page.type('input#password', 'Admin@123');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if error appeared
    const errorDiv = page.locator('.bg-red-50');
    const hasError = await errorDiv.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    expect(hasError).toBe(false);
  });

  test('should take screenshot of login page', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/login-page.png' });
  });

  test('should render admin dashboard after login', async ({ page }) => {
    await page.type('input[name="email"]', 'admin@athena.demo');
    await page.type('input#password', 'Admin@123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    // Screenshot the dashboard
    await page.screenshot({ path: 'test-results/admin-dashboard.png' });
  });

  test('should render coach dashboard after login', async ({ page }) => {
    await page.type('input[name="email"]', 'chitti.coach@gmail.com');
    await page.type('input#password', 'Coach@123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    // Screenshot the dashboard
    await page.screenshot({ path: 'test-results/coach-dashboard.png' });
  });

  test('should render athlete dashboard after login', async ({ page }) => {
    await page.type('input[name="email"]', 'chitti.athlete@gmail.com');
    await page.type('input#password', 'Athlete@123');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    // Screenshot the dashboard
    await page.screenshot({ path: 'test-results/athlete-dashboard.png' });
  });
});

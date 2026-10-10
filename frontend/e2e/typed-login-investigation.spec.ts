import { test, expect } from '@playwright/test';

test.describe('Typed Login Bug Investigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/login');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
  });

  test('Case 1: Character-by-character typed admin login via Enter key', async ({ page }) => {
    await page.type('input[name="email"]', 'admin@athena.demo', { delay: 30 });
    await page.type('input#password', 'Admin@123', { delay: 30 });
    await page.press('input#password', 'Enter');

    await page.waitForURL('**/admin', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });

  test('Case 2: Character-by-character typed coach login with mixed case email', async ({ page }) => {
    await page.type('input[name="email"]', 'Chitti.Coach@Gmail.Com', { delay: 25 });
    await page.type('input#password', 'Coach@123', { delay: 25 });
    await page.click('button[type="submit"]');

    await page.waitForURL('**/coach', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });

  test('Case 3: Character-by-character typed athlete login with leading/trailing spaces in email', async ({ page }) => {
    await page.type('input[name="email"]', '  chitti.athlete@gmail.com  ', { delay: 20 });
    await page.type('input#password', 'Athlete@123', { delay: 20 });
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });

  test('Case 4: Typing password, interacting with eye toggle, then submitting', async ({ page }) => {
    await page.type('input[name="email"]', 'admin@athena.demo', { delay: 20 });
    await page.type('input#password', 'Admin@123', { delay: 20 });

    // Click eye icon to show password
    const eyeButton = page.locator('button[aria-label="Show password"]');
    if (await eyeButton.isVisible()) {
      await eyeButton.click();
    }

    // Submit while password is shown or focused
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });

  test('Case 5: Stale expired token in localStorage before typing login', async ({ page }) => {
    // Put fake expired token in localStorage
    await page.evaluate(() => localStorage.setItem('token', 'fake-expired-stale-token'));
    await page.reload({ waitUntil: 'networkidle' });

    // Type credentials
    await page.type('input[name="email"]', 'admin@athena.demo', { delay: 20 });
    await page.type('input#password', 'Admin@123', { delay: 20 });
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });

  test('Case 6: Fast typing speed (simulating fast user)', async ({ page }) => {
    await page.type('input[name="email"]', 'admin@athena.demo', { delay: 5 });
    await page.type('input#password', 'Admin@123', { delay: 5 });
    await page.click('button[type="submit"]');

    await page.waitForURL('**/admin', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });

  test('Case 7: Direct DOM value assignment without React onChange (simulating password manager / autofill)', async ({ page }) => {
    // Set .value directly on the DOM input elements without dispatching input or change events
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input#password') as HTMLInputElement;
      if (emailInput && passwordInput) {
        emailInput.value = 'admin@athena.demo';
        passwordInput.value = 'Admin@123';
      }
    });

    // Submit form by clicking submit button
    await page.click('button[type="submit"]');

    // Confirm login works and redirects to /admin
    await page.waitForURL('**/admin', { timeout: 10000 });
    const errorDiv = page.locator('.bg-red-50');
    expect(await errorDiv.isVisible().catch(() => false)).toBe(false);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Register and Login Flow', () => {
  test('should register coach with mixed-case space-padded email and login with different case', async ({ page }) => {
    const timestamp = Date.now();
    const emailMixedCase = `  TestCoach${timestamp}@Example.Com  `; // Mixed case with spaces
    const emailDifferentCase = `testcoach${timestamp}@example.com`; // Different case, no spaces
    const password = 'Test&Pass#$123 ';

    // Register as Coach
    await page.goto('http://localhost:3003/register');
    await page.evaluate(() => localStorage.clear());

    await page.type('input[name="name"]', 'Test Coach');
    await page.type('input[name="email"]', emailMixedCase);
    await page.type('input#password', password);
    await page.type('input#confirmPassword', password);

    await page.locator('button').filter({ hasText: 'Coach' }).first().click();
    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await page.waitForTimeout(3000);

    // Check if error appeared
    const errorDiv = page.locator('.bg-red-50');
    const hasError = await errorDiv.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Registration failed with error: ${errorText}`);
    }

    // Logout
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3003/login');

    // Login with different case (no spaces)
    await page.type('input[name="email"]', emailDifferentCase);
    await page.type('input#password', password);
    await page.click('button[type="submit"]');

    // Wait for login
    await page.waitForTimeout(3000);

    // Check if error appeared
    const loginErrorDiv = page.locator('.bg-red-50');
    const hasLoginError = await loginErrorDiv.isVisible().catch(() => false);

    if (hasLoginError) {
      const errorText = await loginErrorDiv.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    expect(hasLoginError).toBe(false);
  });

  test('should register athlete with mixed-case space-padded email and login with different case', async ({ page }) => {
    const timestamp = Date.now();
    const emailMixedCase = `  TestAthlete${timestamp}@Example.Com  `; // Mixed case with spaces
    const emailDifferentCase = `testathlete${timestamp}@example.com`; // Different case, no spaces
    const password = 'Test&Pass#$123 ';

    // Register as Athlete
    await page.goto('http://localhost:3003/register');
    await page.evaluate(() => localStorage.clear());

    await page.type('input[name="name"]', 'Test Athlete');
    await page.type('input[name="email"]', emailMixedCase);
    await page.type('input#password', password);
    await page.type('input#confirmPassword', password);

    await page.locator('button').filter({ hasText: 'Athlete' }).first().click();
    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await page.waitForTimeout(3000);

    // Check if error appeared
    const errorDiv = page.locator('.bg-red-50');
    const hasError = await errorDiv.isVisible().catch(() => false);

    if (hasError) {
      const errorText = await errorDiv.textContent();
      throw new Error(`Registration failed with error: ${errorText}`);
    }

    // Logout
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3003/login');

    // Login with different case (no spaces)
    await page.type('input[name="email"]', emailDifferentCase);
    await page.type('input#password', password);
    await page.click('button[type="submit"]');

    // Wait for login
    await page.waitForTimeout(3000);

    // Check if error appeared
    const loginErrorDiv = page.locator('.bg-red-50');
    const hasLoginError = await loginErrorDiv.isVisible().catch(() => false);

    if (hasLoginError) {
      const errorText = await loginErrorDiv.textContent();
      throw new Error(`Login failed with error: ${errorText}`);
    }

    expect(hasLoginError).toBe(false);
  });

  test('should register and login typing a password with & # $ and inner space ("Ab&c#1 $x")', async ({ page }) => {
    const timestamp = Date.now();
    const email = `special_pass_${timestamp}@example.com`;
    const specialPassword = 'Ab&c#1 $x';

    // 1. Go to register page
    await page.goto('http://localhost:3003/register');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');

    // Type (character by character, not paste) into every input
    await page.type('input[name="name"]', 'Special Pass Athlete');
    await page.type('input[name="email"]', email);
    await page.type('input#password', specialPassword);
    await page.type('input#confirmPassword', specialPassword);

    // Select Athlete role
    await page.locator('button').filter({ hasText: 'Athlete' }).first().click();

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Verify registration succeeded
    const registerError = page.locator('.bg-red-50');
    expect(await registerError.isVisible().catch(() => false)).toBe(false);

    // 2. Logout: clear storage and navigate to login
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:3003/login');
    await page.waitForLoadState('networkidle');

    // Type credentials character by character
    await page.type('input[name="email"]', email);
    await page.type('input#password', specialPassword);

    // Submit login
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Verify login succeeded with no error
    const loginError = page.locator('.bg-red-50');
    expect(await loginError.isVisible().catch(() => false)).toBe(false);

    // Verify dashboard content is visible
    await expect(page.locator('text=ATHENA').first()).toBeVisible();

    // Screenshot success
    await page.screenshot({ path: 'test-results/special-char-password-login.png' });
  });
});

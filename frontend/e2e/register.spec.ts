import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('http://localhost:3003/register');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3003/register');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors.length).toBe(0);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
  });

  test('should have no role selected on load', async ({ page }) => {
    await page.goto('http://localhost:3003/register');

    // Check that both role buttons are unselected (not yellow/amber)
    const athleteButton = page.locator('button').filter({ hasText: 'Athlete' }).first();
    const coachButton = page.locator('button').filter({ hasText: 'Coach' }).first();

    const athleteClasses = await athleteButton.getAttribute('class');
    const coachClasses = await coachButton.getAttribute('class');

    expect(athleteClasses).not.toContain('amber-500');
    expect(athleteClasses).not.toContain('bg-amber-50');
    expect(coachClasses).not.toContain('amber-500');
    expect(coachClasses).not.toContain('bg-amber-50');

    // Check that submit button is disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('submit button is disabled until role is selected', async ({ page }) => {
    await page.goto('http://localhost:3003/register');

    // Fill all fields except role
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input#password', 'test123');
    await page.fill('input#confirmPassword', 'test123');

    // Verify submit button is still disabled
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // Select Athlete role
    await page.locator('button').filter({ hasText: 'Athlete' }).first().click();

    // Now submit button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should take screenshot on load', async ({ page }) => {
    await page.goto('http://localhost:3003/register');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/register-load.png' });
  });

  test('should check browser console on /register after hard refresh', async ({ page }) => {
    const consoleLogs: { type: string; text: string }[] = [];
    const pageErrors: string[] = [];

    page.on('console', msg => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    await page.goto('http://localhost:3003/register');
    await page.waitForLoadState('networkidle');

    // Perform hard refresh (reload)
    await page.reload({ waitUntil: 'networkidle' });

    console.log('CONSOLE_LOGS_AFTER_HARD_REFRESH:', JSON.stringify(consoleLogs));
    console.log('PAGE_ERRORS_AFTER_HARD_REFRESH:', JSON.stringify(pageErrors));

    // Page must not be blank
    const heading = page.locator('h2');
    await expect(heading).toContainText('Create your account');
    expect(pageErrors.length).toBe(0);
  });

  test('should show error when submitting /register with no role', async ({ page }) => {
    await page.goto('http://localhost:3003/register');
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="name"]', 'No Role User');
    await page.fill('input[name="email"]', 'norole@example.com');
    await page.fill('input#password', 'ValidPass123');
    await page.fill('input#confirmPassword', 'ValidPass123');

    // Verify submit button is disabled initially
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();

    // Trigger form submission to test no-role validation
    await page.locator('form').evaluate((form: HTMLFormElement) => {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });

    // Check error message
    const errorDiv = page.locator('.bg-red-50');
    await expect(errorDiv).toBeVisible();
    await expect(errorDiv).toContainText('Please select Athlete or Coach');

    // Take screenshot of no-role error
    await page.screenshot({ path: 'test-results/register-no-role-error.png' });
  });

  test('should successfully register as Athlete and show dashboard', async ({ page }) => {
    const timestamp = Date.now();
    const email = `athlete_ui_${timestamp}@example.com`;

    await page.goto('http://localhost:3003/register');
    await page.waitForLoadState('networkidle');

    await page.type('input[name="name"]', 'Playwright Athlete');
    await page.type('input[name="email"]', email);
    await page.type('input#password', 'AthletePass123');
    await page.type('input#confirmPassword', 'AthletePass123');

    // Select Athlete role
    await page.locator('button').filter({ hasText: 'Athlete' }).first().click();

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for redirection to athlete dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/register-athlete-success.png' });
  });

  test('should successfully register as Coach and show coach dashboard', async ({ page }) => {
    const timestamp = Date.now();
    const email = `coach_ui_${timestamp}@example.com`;

    await page.goto('http://localhost:3003/register');
    await page.waitForLoadState('networkidle');

    await page.type('input[name="name"]', 'Playwright Coach');
    await page.type('input[name="email"]', email);
    await page.type('input#password', 'CoachPass123');
    await page.type('input#confirmPassword', 'CoachPass123');

    // Select Coach role
    await page.locator('button').filter({ hasText: 'Coach' }).first().click();

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for redirection to coach dashboard
    await page.waitForURL('**/coach', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/register-coach-success.png' });
  });
});

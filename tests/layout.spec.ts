import { test, expect } from '@playwright/test';

test.describe('IZODIAMANT Frontend Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Accept cookies only if needed
    const acceptButton = page.locator('.btn-primary').filter({ hasText: 'Povolit vše' });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
    }
  });

  test('Core page elements are visible', async ({ page, isMobile }) => {
    // Hero
    await expect(page.locator('h1')).toBeVisible();
    
    // Navigation
    await expect(page.locator('header')).toBeVisible();
    if (isMobile) {
      await expect(page.locator('button[aria-label*="menu"]')).toBeVisible();
    } else {
      await expect(page.locator('nav a')).not.toHaveCount(0);
    }

    // Technology & Calculator
    await expect(page.locator('#technologie')).toBeVisible();
    await expect(page.locator('#calculator')).toBeVisible();
    await expect(page.locator('input[type="range"]')).toHaveCount(2);

    // References
    await expect(page.locator('#reference')).toBeVisible();
    await expect(page.locator('#reference .group')).not.toHaveCount(0);

    // Footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('Typography and scaling', async ({ page }) => {
    const h2 = page.locator('h2').first();
    const fontSize = await h2.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(parseFloat(fontSize)).toBeGreaterThan(20);
  });

  test('Primary buttons are usable', async ({ page }) => {
    const btn = page.locator('.btn-primary').filter({ visible: true }).first();
    await expect(btn).toBeVisible();
    
    const box = await btn.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('References dates format', async ({ page }) => {
    const dates = page.locator('#reference .bg-primary\\/90');
    if (await dates.count() > 0) {
      const dateText = await dates.first().innerText();
      expect(dateText).toMatch(/[A-Z][A-Za-z]+ \d{4}/i);
      expect(dateText).not.toMatch(/\.$/);
    }
  });

  test('Pricing calculator tooltip bounds', async ({ page }) => {
    const calculator = page.locator('#calculator');
    await calculator.scrollIntoViewIfNeeded();

    const infoIcon = page.locator('#calculator .group').first();
    const tooltip = page.getByTestId('price-tooltip');

    await infoIcon.hover();
    await expect(tooltip).toBeVisible();

    const tooltipBox = await tooltip.boundingBox();
    const viewport = page.viewportSize();

    if (tooltipBox && viewport) {
      expect(tooltipBox.x).toBeGreaterThanOrEqual(-1);
      expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  });
});

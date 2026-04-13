import { test, expect } from '@playwright/test';

test.describe('Visual Integrity & Responsive Checks', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Quick cookie acceptance
    const acceptButton = page.locator('.btn-primary').filter({ hasText: 'Povolit vše' });
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
    }
  });

  test('Layout stability checks', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    const dimensions = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      };
    });

    // Overflow check
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

    // Section sequence check
    const selectors = ['header', '#technologie', '#calculator', '#reference', 'footer'];
    let previousY = -100;
    
    for (const selector of selectors) {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible();
      const box = await element.boundingBox();
      if (box && selector !== 'header') {
        expect(box.y).toBeGreaterThanOrEqual(previousY + 50); // basic non-overlapping
        previousY = box.y;
      }
    }
  });

  test('Responsive text containment', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    // Sample H1/H2 for overflow
    const headers = page.locator('h1, h2').filter({ visible: true });
    const count = await headers.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await headers.nth(i).boundingBox();
      if (box) {
        expect(box.x).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      }
    }
  });
});

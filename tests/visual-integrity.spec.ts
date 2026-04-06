import { test, expect } from '@playwright/test';

test.describe('Visual Integrity & Responsive Checks', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Accept cookies if the modal is present
    const acceptButton = page.locator('.btn-primary').filter({ hasText: 'Povolit vše' });
    try {
      // Small wait for the dynamic component to mount
      await acceptButton.waitFor({ state: 'visible', timeout: 3000 });
      await acceptButton.click();
    } catch (e) {
      // Modal might not have appeared or already accepted
    }
    
    // Wait for network to settle and animations to finish
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
  });

  test('No horizontal overflow should occur', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    const dimensions = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth
      };
    });

    // 1px margin for rounding
    expect(dimensions.scrollWidth, 'Document scrollWidth exceeds clientWidth').toBeLessThanOrEqual(dimensions.clientWidth + 1);
    expect(dimensions.bodyScrollWidth, 'Body scrollWidth exceeds clientWidth').toBeLessThanOrEqual(dimensions.clientWidth + 1);
  });

  test('Pricing calculator tooltip is visible and within bounds', async ({ page }) => {
    const calculator = page.locator('#calculator');
    await expect(calculator).toBeVisible({ timeout: 10000 });
    await calculator.scrollIntoViewIfNeeded();
    
    // Trigger tooltip - parent of the info icon is the hover group
    const infoIcon = page.locator('#calculator .group').first();
    const tooltip = page.getByTestId('price-tooltip');

    // On mobile, tap (click) is needed. On desktop, hover works.
    // We do both to ensure visibility across all interaction patterns.
    await infoIcon.click({ force: true });
    await infoIcon.hover({ force: true });
    
    // Check visibility
    await expect(tooltip).toBeVisible();
    
    // Viewport containment check
    const tooltipBox = await tooltip.boundingBox();
    const viewport = page.viewportSize();

    if (tooltipBox && viewport) {
      expect(tooltipBox.x, 'Tooltip overflow left').toBeGreaterThanOrEqual(-1);
      expect(tooltipBox.x + tooltipBox.width, 'Tooltip overflow right').toBeLessThanOrEqual(viewport.width + 1);
    }
  });

  test('Content sections should not have negative vertical overlap', async ({ page }) => {
    // We check if sections follow each other in order and don't overlap in a way that covers content
    const selectors = ['header', 'section#technologie', 'section#calculator', 'section#reference', 'footer'];
    
    let previousBox: { y: number, height: number } | null = null;
    
    for (const selector of selectors) {
      const element = page.locator(selector).first();
      await expect(element).toBeVisible();
      const box = await element.boundingBox();
      
      if (box && previousBox) {
        // Except for fixed/absolute elements like header, 
        // the top of the current section should be >= the bottom of the previous section
        if (selector !== 'header') {
          // Allowing 50px of overlap for intentional design offsets (like negative margins)
          // but anything more might indicate "covering"
          expect(box.y, `Section ${selector} is covering previous content`).toBeGreaterThanOrEqual(previousBox.y + previousBox.height - 50);
        }
      }
      
      // Don't track fixed header as a previous block for sequence flow
      if (selector !== 'header') {
        previousBox = box;
      }
    }
  });

  test('Critical text is not cut off or covered', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) return;

    // Check H1 and main H2s
    const headers = page.locator('h1, h2').filter({ visible: true });
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const box = await header.boundingBox();
      
      if (box) {
        // Horizontal check
        expect(box.x).toBeGreaterThanOrEqual(-1);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
        
        // Basic visibility check - ensure it's not collapsed
        expect(box.height).toBeGreaterThan(10);
      }
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('IZODIAMANT Frontend Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Accept cookies if the modal is present
    const acceptButton = page.locator('.btn-primary').filter({ hasText: 'Povolit vše' });
    try {
      await acceptButton.waitFor({ state: 'visible', timeout: 3000 });
      await acceptButton.click();
    } catch (e) {
      // Modal might not have appeared or already accepted
    }

    await page.waitForLoadState('networkidle');
  });

  test('Hero section layout and text visibility', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check if hero content is properly centered
    const heroContent = page.locator('section').first();
    const box = await heroContent.boundingBox();
    expect(box).not.toBeNull();
  });

  test('Primary navigation responsiveness', async ({ page, isMobile }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    if (isMobile) {
      const menuButton = page.locator('button[aria-label*="menu"]');
      await expect(menuButton).toBeVisible();
    } else {
      const navLinks = page.locator('nav a');
      await expect(navLinks).not.toHaveCount(0);
    }
  });

  test('Typography and scaling', async ({ page }) => {
    const h2 = page.locator('h2').first();
    const fontSize = await h2.evaluate((el) => window.getComputedStyle(el).fontSize);
    expect(parseFloat(fontSize)).toBeGreaterThan(20);
  });

  test('Primary buttons contrast and size', async ({ page }) => {
    const btn = page.locator('.btn-primary').filter({ visible: true }).first();
    await expect(btn).toBeVisible();
    
    const box = await btn.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44); // Mobile-friendly touch target
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('Pricing Calculator usability', async ({ page }) => {
    const calculator = page.locator('#calculator');
    await expect(calculator).toBeVisible();
    
    // Check sliders
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);
  });

  test('References section rendering', async ({ page }) => {
    const references = page.locator('#reference');
    await expect(references).toBeVisible();
    
    const referenceCards = page.locator('#reference .group');
    await expect(referenceCards).not.toHaveCount(0);
    
    // Check dates format (Month Year - e.g. "Červenec 2024")
    const dates = page.locator('#reference .bg-primary\\/90');
    if (await dates.count() > 0) {
      const dateText = await dates.first().innerText();
      expect(dateText).toMatch(/[A-Z][A-Za-z]+ \d{4}/i);
      expect(dateText).not.toMatch(/\.$/); // Should NOT end with a dot
    }
  });

  test('Footer visibility and content', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check localized rating in footer
    const footerRating = footer.locator('span').filter({ hasText: /5\.0|4\.9/ });
    await expect(footerRating).toBeVisible();
  });

  test('Pricing calculator tooltip viewport bounds', async ({ page }) => {
    // Scroll to calculator
    const calculator = page.locator('#calculator');
    await calculator.scrollIntoViewIfNeeded();

    // Find info icon (the group parent)
    const infoIcon = page.locator('#calculator .group').first();
    const tooltip = page.getByTestId('price-tooltip');

    // Hover to show tooltip
    await infoIcon.hover();
    await expect(tooltip).toBeVisible();

    // Get bounding boxes
    const tooltipBox = await tooltip.boundingBox();
    const viewport = page.viewportSize();

    if (tooltipBox && viewport) {
      // Check if tooltip is within horizontal bounds
      // We allow a small 1px margin for rounding
      expect(tooltipBox.x).toBeGreaterThanOrEqual(-1);
      expect(tooltipBox.x + tooltipBox.width).toBeLessThanOrEqual(viewport.width + 1);
    }
  });
});

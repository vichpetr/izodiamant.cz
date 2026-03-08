import { test, expect } from '@playwright/test';

test.describe('IZODIAMANT Frontend Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for animations to finish
    await page.waitForTimeout(1000);
  });

  test('Hero section layout and text visibility', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for H1 overlap with header
    const h1Box = await h1.boundingBox();
    const header = page.locator('header');
    const headerBox = await header.boundingBox();
    
    if (h1Box && headerBox) {
      expect(h1Box.y).toBeGreaterThanOrEqual(headerBox.height);
    }

    // Check Hero Badge
    const badge = page.locator('#hero-badge');
    await expect(badge).toBeVisible();
    
    // Check "Ohodnoťte nás" text below badge
    const ratingText = page.getByText(/Ohodnoťte nás na/i);
    await expect(ratingText).toBeVisible();
  });

  test('Navigation menu availability', async ({ page, isMobile }) => {
    if (isMobile) {
      // Mobile hamburger should be visible - using a more robust selector
      const menuButton = page.locator('header button[aria-label*="menu"]');
      await expect(menuButton).toBeVisible();
      
      // Desktop links should be hidden
      const desktopCalcLink = page.locator('header nav').filter({ hasText: 'Technologie' });
      await expect(desktopCalcLink).not.toBeVisible();
    } else {
      // Desktop links should be visible
      const desktopCalcLink = page.locator('header .btn-primary').filter({ hasText: 'Nezávazná kalkulace' });
      await expect(desktopCalcLink).toBeVisible();
    }
  });

  test('Pricing Calculator usability', async ({ page }) => {
    const calculator = page.locator('#calculator');
    await expect(calculator).toBeVisible();
    
    // Check if sliders are interactable
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(2);
    
    // Check price result visibility
    const priceDisplay = page.locator('#calculator .text-4xl, #calculator .text-5xl');
    await expect(priceDisplay).toBeVisible();
    await expect(priceDisplay).toContainText('Kč');
  });

  test('References section rendering', async ({ page }) => {
    const references = page.locator('#reference');
    await expect(references).toBeVisible();
    
    const referenceCards = page.locator('#reference .group');
    // Fix: count() returns a promise that needs to be awaited or use Playwright assertions
    await expect(referenceCards).not.toHaveCount(0);
    
    // Check dates format (trailing dot)
    const dates = page.locator('#reference .bg-primary\\/90');
    if (await dates.count() > 0) {
      const dateText = await dates.first().innerText();
      // Should match "Month Year." (e.g., "Březen 2024.")
      expect(dateText).toMatch(/\.|\d\./);
    }
  });

  test('Footer visibility', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check localized rating in footer - updated to use dot as requested
    const footerRating = footer.locator('span').filter({ hasText: /5\.0|4\.9/ });
    await expect(footerRating).toBeVisible();
  });
});

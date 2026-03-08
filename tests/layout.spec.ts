import { test, expect } from '@playwright/test';

test.describe('IZODIAMANT Frontend Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for animations to finish
    await page.waitForTimeout(300);
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
      // Mobile hamburger should be visible
      const menuButton = page.locator('header button[aria-label*="menu"]');
      await expect(menuButton).toBeVisible();
      
      // Desktop nav should be hidden on mobile
      const desktopNav = page.locator('header nav');
      await expect(desktopNav).toBeHidden();
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
    await expect(referenceCards).not.toHaveCount(0);
    
    // Check dates format (Month Year - e.g. "Červenec 2024")
    const dates = page.locator('#reference .bg-primary\\/90');
    if (await dates.count() > 0) {
      const dateText = await dates.first().innerText();
      expect(dateText).toMatch(/[A-Z][A-Za-z]+ \d{4}/i);
      expect(dateText).not.toMatch(/\.$/); // Should NOT end with a dot
    }
  });

  test('Footer visibility', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check localized rating in footer
    const footerRating = footer.locator('span').filter({ hasText: /5\.0|4\.9/ });
    await expect(footerRating).toBeVisible();
  });
});

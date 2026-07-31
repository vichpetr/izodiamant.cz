import { test, expect } from '@playwright/test';

test.describe('SEO and Metadata', () => {
  test('robots.txt is valid and accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    
    // Standard directives should be present (case-insensitive check for User-agent)
    expect(text.toLowerCase()).toContain('user-agent: *');
    expect(text).toContain('Sitemap: https://izodiamant.cz/sitemap.xml');
    
    // Content-Signal should be present (Agent-Ready requirement).
    // Ověřuje se význam, ne přesný řetězec – pořadí direktiv se může měnit a
    // natvrdo zadaná hodnota se rozešla s robots.txt (rozbitá CI po změně signálu).
    // Konkrétní hodnoty hlídá „Audit: robots.txt a AI crawleři“ v audit.spec.ts.
    const signal = text.match(/^Content-Signal:\s*(.+)$/m)?.[1] ?? '';
    expect(signal, 'Content-Signal chybí v robots.txt').toBeTruthy();
    expect(signal).toContain('search=yes');
    
    // AI bots should NOT be blocked anymore (based on Agent-Ready request)
    expect(text).not.toContain('User-agent: GPTBot\nDisallow: /');
  });

  test('homepage has correct Seznam Webmaster Tool meta tag', async ({ page }) => {
    await page.goto('/');
    const metaTag = await page.locator('meta[name="seznam-wmt"]');
    await expect(metaTag).toHaveAttribute('content', 'jBGItML1UXuDGvnSeGbBsYQ6hdrkMfeI');
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('<urlset');
    expect(text).toContain('https://izodiamant.cz');
  });
});

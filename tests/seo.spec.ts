import { test, expect } from '@playwright/test';

test.describe('SEO and Metadata', () => {
  test('robots.txt is valid and accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    
    // Standard directives should be present
    expect(text).toContain('User-Agent: *');
    expect(text).toContain('Sitemap: https://izodiamant.cz/sitemap.xml');
    
    // Invalid directive from the audit should be gone
    expect(text).not.toContain('Content-Signal');
    expect(text).not.toContain('ai-train');
    
    // AI blocks should be present (based on our fix)
    expect(text).toContain('User-Agent: GPTBot');
    expect(text).toContain('Disallow: /');
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('<urlset');
    expect(text).toContain('https://izodiamant.cz');
  });
});

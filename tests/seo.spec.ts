import { test, expect } from '@playwright/test';

test.describe('SEO and Metadata', () => {
  test('robots.txt is valid and accessible', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    
    // Standard directives should be present (case-insensitive check for User-agent)
    expect(text.toLowerCase()).toContain('user-agent: *');
    expect(text).toContain('Sitemap: https://izodiamant.cz/sitemap.xml');
    
    // Content-Signal should be present (Agent-Ready requirement)
    expect(text).toContain('Content-Signal: ai-train=no, search=yes, ai-input=no');
    
    // AI bots should NOT be blocked anymore (based on Agent-Ready request)
    expect(text).not.toContain('User-agent: GPTBot\nDisallow: /');
  });

  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    const text = await response.text();
    expect(text).toContain('<urlset');
    expect(text).toContain('https://izodiamant.cz');
  });
});

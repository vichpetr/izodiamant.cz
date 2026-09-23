import { test, expect } from '@playwright/test';

/**
 * Skrytá admin sekce /sprava.
 * Hlídá, že je opravdu skrytá a chráněná: nepřihlášený se nedostane dovnitř,
 * sekce se neindexuje a není v sitemapě. (Přihlášený tok vyžaduje Google OAuth +
 * D1 a ověřuje se na preview deploji, ne v CI.)
 */

test.describe('Admin /sprava: skrytá a chráněná', () => {
  test('nepřihlášený /sprava se přesměruje na přihlášení', async ({ page }) => {
    await page.goto('/sprava');
    await expect(page).toHaveURL(/\/sprava\/prihlaseni$/);
    await expect(page.getByRole('button', { name: /Přihlásit přes Google/i })).toBeVisible();
  });

  test('nepřihlášený /sprava/log se přesměruje na přihlášení', async ({ page }) => {
    await page.goto('/sprava/log');
    await expect(page).toHaveURL(/\/sprava\/prihlaseni$/);
  });

  test('nepřihlášený /sprava/nabidky se přesměruje na přihlášení', async ({ page }) => {
    await page.goto('/sprava/nabidky?id=1');
    await expect(page).toHaveURL(/\/sprava\/prihlaseni$/);
  });

  test('PDF nabídek nejdou stáhnout bez přihlášení', async ({ request }) => {
    const res = await request.get('/sprava/nabidky/soubor?key=nabidky/NAB-20260101-XXX.pdf', { maxRedirects: 0 });
    expect(res.headers()['content-type'] ?? '').not.toContain('application/pdf');
    expect([302, 303, 307, 308, 403]).toContain(res.status());
  });

  test('přihlašovací stránka má noindex', async ({ page }) => {
    await page.goto('/sprava/prihlaseni');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('robots.txt zakazuje /sprava', async ({ request }) => {
    const txt = await (await request.get('/robots.txt')).text();
    expect(txt).toContain('Disallow: /sprava');
  });

  test('sitemap /sprava neobsahuje', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml).not.toContain('/sprava');
  });
});

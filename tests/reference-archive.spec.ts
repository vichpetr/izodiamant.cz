import { test, expect } from '@playwright/test';
import {
  allReferences,
  REFERENCES_PER_PAGE,
  referencePageCount,
} from '../src/lib/references';

/**
 * Archiv referencí (/reference) – samostatná stránka se stránkováním a
 * členěním po letech. Homepage z něj ukazuje jen nejnovější výběr.
 */

const cards = 'div.group > a[href^="/reference/"]';

test.describe('Archiv referencí', () => {
  test('/reference vypíše první stranu a odkáže na další', async ({ page }) => {
    await page.goto('/reference');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Reference');
    await expect(page.locator(cards)).toHaveCount(
      Math.min(REFERENCES_PER_PAGE, allReferences.length),
    );

    if (referencePageCount > 1) {
      await expect(page.locator('a[href="/reference/strana/2"]').first()).toBeVisible();
    }
  });

  test('reference jsou členěné po letech (nadpis roku s kotvou)', async ({ page }) => {
    await page.goto('/reference');
    const firstYear = allReferences[0].date.slice(0, 4);
    await expect(page.locator(`h2#rok-${firstYear}`)).toBeVisible();
  });

  test('další strana ukáže starší reference (žádný překryv)', async ({ page }) => {
    test.skip(referencePageCount < 2, 'zatím je jen jedna strana archivu');

    await page.goto('/reference');
    const first = await page.locator(cards).evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')),
    );

    await page.goto('/reference/strana/2');
    const second = await page.locator(cards).evaluateAll((els) =>
      els.map((el) => el.getAttribute('href')),
    );

    expect(second.length).toBeGreaterThan(0);
    expect(second.filter((href) => first.includes(href))).toEqual([]);
  });

  test('neexistující strana vrací 404', async ({ request }) => {
    const res = await request.get(`/reference/strana/${referencePageCount + 90}`);
    expect(res.status()).toBe(404);
  });

  test('homepage ukazuje jen výběr a odkazuje na archiv', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator(`#reference ${cards}`)).toHaveCount(3);
    await expect(page.locator('#reference a[href="/reference"]')).toBeVisible();
  });
});

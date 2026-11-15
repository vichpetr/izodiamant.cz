import { test, expect } from '@playwright/test';
import articles from '../src/data/articles.json';

test('nabídka rozlišuje orientační výpočet od individuální zakázky', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('samostatné diamantové řezání');
  await expect(page.locator('#contact')).toContainText('Cenu, dopravu i prohlídku domluvíme individuálně');
  await expect(page.locator('#calculator')).toContainText('Pro samostatné řezy a nestandardní konstrukce');
  await expect(page.getByRole('link', { name: 'Orientační kalkulace', exact: true }).first()).toHaveAttribute('href', '/#calculator');
});

test('všechny služby mají individuální podmínky a cestu k nabídce', async ({ page }) => {
  for (const slug of ['diamantove-lano', 'retezova-pila', 'chemicka-injektaz']) {
    await page.goto(`/sluzby/${slug}`);
    await expect(page.locator('body')).toContainText('samostatn');
    await expect(page.locator('body')).toContainText('Cenu, dopravu i prohlídku domluvíme individuálně');
    await expect(page.getByRole('link', { name: 'vyžádat cenovou nabídku', exact: true })).toHaveAttribute('href', '/#contact');
  }
});

test('ani archiv, oblasti a články neslibují prohlídku zdarma', async ({ page }) => {
  for (const path of ['/reference', '/kde-pusobime', '/sluzby/zednicke-a-obkladacske-prace', ...articles.map(a => `/clanky/${a.slug}`)]) {
    await page.goto(path);
    await expect(page.locator('body')).not.toContainText(/zdarma|bezplatn/i);
    await expect(page.locator('body')).toContainText(/(?:cenu|cena).*doprav.*prohlíd/i);
  }
});

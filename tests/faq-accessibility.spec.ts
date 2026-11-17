import { test, expect } from '@playwright/test';
import faq from '../src/data/faq.json';

test('zavřené FAQ oznamuje stav a skrývá odpovědi před čtečkou', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#faq');
  const controls = new Set<string>();
  for (const item of faq) {
    const button = section.getByRole('button', { name: item.question, exact: true });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    const id = await button.getAttribute('aria-controls');
    expect(id).toBeTruthy();
    expect(controls.has(id!)).toBe(false);
    controls.add(id!);
    await expect(page.locator(`[id="${id}"]`)).toHaveText(item.answer);
  }
  const tree = await section.ariaSnapshot();
  for (const item of faq) expect(tree).not.toContain(item.answer);
});

test('Enter a mezerník přepínají FAQ se zachováním fokusu', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#faq');
  const first = section.getByRole('button', { name: faq[0].question, exact: true });
  const second = section.getByRole('button', { name: faq[1].question, exact: true });
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first).toHaveCSS('outline-style', 'solid');
  await first.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toBeFocused();
  expect(await section.ariaSnapshot()).toContain(faq[0].answer);
  await second.press('Space');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(first).toHaveAttribute('aria-expanded', 'true');
  await first.press('Space');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  expect(await section.ariaSnapshot()).not.toContain(faq[0].answer);
});

import { test, expect, type Page } from '@playwright/test';

/**
 * Měření konverzí pro Google Ads.
 *
 * Události se posílají přes gtag, ale GA se načítá až při interakci a jen se
 * souhlasem – proto se tady čte přímo `window.dataLayer`, kam `trackEvent`
 * událost zařadí i bez načteného gtag.js. Testujeme tedy to, na čem záleží:
 * že se událost vůbec vytvoří a se správnými parametry.
 */

/** Vytáhne z dataLayer události daného jména (obě podoby zápisu gtag). */
async function eventsNamed(page: Page, name: string) {
  return page.evaluate((wanted) => {
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
    return dl
      .map((entry) => (Array.isArray(entry) ? entry : Array.from(entry as ArrayLike<unknown>)))
      .filter((a) => a[0] === 'event' && a[1] === wanted)
      .map((a) => a[2] as Record<string, unknown>);
  }, name);
}

test.describe('Konverze: klik na telefon', () => {
  test('klik na tel: odkaz odešle click_to_call', async ({ page }) => {
    await page.goto('/');
    // ConversionTracking se načítá dynamicky (ssr: false) – bez čekání na
    // dokončení načtení by se kliklo dřív, než se posluchač vůbec zaregistruje.
    await page.waitForLoadState('networkidle');

    await page.locator('a[href^="tel:"]').first().click({ force: true });

    const events = await eventsNamed(page, 'click_to_call');
    expect(events.length, 'click_to_call se neodeslal').toBeGreaterThan(0);
    expect(String(events[0].phone_number)).toMatch(/^\+?\d+$/);
  });
});

test.describe('Konverze: odeslání poptávky', () => {
  test('úspěšný kontaktní formulář odešle generate_lead', async ({ page }) => {
    await page.route('**/api/send', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
    );

    await page.goto('/');
    await page.locator('#contact-name').fill('Jan Novák');
    await page.locator('#contact-phone').fill('737017012');
    await page.locator('#contact-message').fill('Vlhké zdivo v přízemí, prosím o nabídku.');
    await page.getByRole('button', { name: /Odeslat zprávu/i }).click();

    await expect(page.getByText(/Děkujeme|Odesláno|brzy/i).first()).toBeVisible({ timeout: 10000 });

    const events = await eventsNamed(page, 'generate_lead');
    expect(events.length, 'generate_lead se neodeslal').toBeGreaterThan(0);
    expect(events[0].form_source).toBe('kontaktni-formular');
  });

  test('při chybě serveru se konverze NEodešle (kalkulačka hlásila úspěch i po selhání)', async ({
    page,
  }) => {
    await page.route('**/api/send', (route) => route.fulfill({ status: 500, body: '{}' }));
    page.on('dialog', (d) => d.dismiss());

    await page.goto('/');
    await page.locator('#contact-name').fill('Jan Novák');
    await page.locator('#contact-phone').fill('737017012');
    await page.locator('#contact-message').fill('Test chybové cesty.');
    await page.getByRole('button', { name: /Odeslat zprávu/i }).click();

    await page.waitForTimeout(1000);
    const events = await eventsNamed(page, 'generate_lead');
    expect(events.length, 'konverze se změřila i při selhání odeslání').toBe(0);
  });
});

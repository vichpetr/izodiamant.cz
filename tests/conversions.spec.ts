import { test, expect, type Page } from '@playwright/test';

/**
 * Měření konverzí pro Google Ads.
 *
 * Události se posílají přes gtag, ale GA se načítá až při interakci a jen se
 * souhlasem – proto se tady čte přímo `window.dataLayer`, kam `trackEvent`
 * událost zařadí i bez načteného gtag.js. Testujeme tedy to, na čem záleží:
 * že se událost vůbec vytvoří a se správnými parametry.
 */

/**
 * Cookie lišta je `fixed bottom-8 z-50` a na tabletu/mobilu překrývá odesílací
 * tlačítko formuláře (klik pak vyprší). Uložený souhlas ji nevykreslí vůbec.
 */
async function skipCookieBanner(page: Page) {
  await page.addInitScript(() => localStorage.setItem('cookie-consent', 'false'));
}

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

/** Vyplní kontaktní formulář a odešle ho. */
async function submitContactForm(page: Page, message: string) {
  await page.locator('#contact-name').fill('Jan Novák');
  await page.locator('#contact-phone').fill('737017012');
  await page.locator('#contact-message').fill(message);

  const submit = page.getByRole('button', { name: /Odeslat zprávu/i });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();
}

test.describe('Konverze: klik na telefon', () => {
  test('klik na tel: odkaz odešle click_to_call', async ({ page }) => {
    await skipCookieBanner(page);
    await page.goto('/');

    // Nutně `:visible` – první tel: odkaz v pořadí je ten z desktopové hlavičky,
    // který je na mobilu skrytý, a klik na skrytý prvek žádnou událost nevyvolá.
    const link = page.locator('a[href^="tel:"]:visible').first();
    await link.waitFor();

    // ConversionTracking se načítá dynamicky (ssr: false), takže posluchač
    // vzniká až po hydrataci. Místo čekání na síť (v CI kvůli dotahování
    // recenzí nikdy nenastane klid) klikáme, dokud se událost neobjeví.
    await expect
      .poll(async () => {
        await link.click({ force: true });
        return (await eventsNamed(page, 'click_to_call')).length;
      }, { timeout: 20_000, message: 'click_to_call se neodeslal' })
      .toBeGreaterThan(0);

    const events = await eventsNamed(page, 'click_to_call');
    expect(String(events[0].phone_number)).toMatch(/^\+?\d+$/);
  });
});

test.describe('Konverze: odeslání poptávky', () => {
  test('úspěšný kontaktní formulář odešle generate_lead', async ({ page }) => {
    await skipCookieBanner(page);
    await page.route('**/api/send', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
    );

    await page.goto('/');
    await submitContactForm(page, 'Vlhké zdivo v přízemí, prosím o nabídku.');

    await expect(page.getByText(/Děkujeme|Odesláno|brzy/i).first()).toBeVisible({ timeout: 15_000 });

    const events = await eventsNamed(page, 'generate_lead');
    expect(events.length, 'generate_lead se neodeslal').toBeGreaterThan(0);
    expect(events[0].form_source).toBe('kontaktni-formular');
  });

  test('při chybě serveru se konverze NEodešle (kalkulačka hlásila úspěch i po selhání)', async ({
    page,
  }) => {
    await skipCookieBanner(page);
    await page.route('**/api/send', (route) => route.fulfill({ status: 500, body: '{}' }));
    page.on('dialog', (d) => d.dismiss());

    await page.goto('/');
    await submitContactForm(page, 'Test chybové cesty.');

    // Formulář musí zůstat zobrazený – úspěch se hlásit nesmí.
    await expect(page.locator('#contact-name')).toBeVisible();
    expect(
      (await eventsNamed(page, 'generate_lead')).length,
      'konverze se změřila i při selhání odeslání',
    ).toBe(0);
  });
});

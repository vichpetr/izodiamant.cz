import { test, expect } from '@playwright/test';
import { createHash } from 'node:crypto';

const enforced = process.env.CSP_ENFORCE === 'true';
const hstsMaxAge = process.env.HSTS_ONE_YEAR === 'true' ? 31536000 : 2592000;
test.describe('Security headers', () => {
  for (const path of ['/', '/clanky', '/sluzby/diamantove-lano', '/api/send']) {
    test(`hlavičky na ${path}`, async ({ request }) => {
      const res = await request.get(path);
      const h = res.headers();
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['x-frame-options']).toBe('SAMEORIGIN');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['strict-transport-security']).toBe(`max-age=${hstsMaxAge}`);
      expect(h['permissions-policy']).toContain('camera=()');
    });
  }
});

test.describe('Content-Security-Policy', () => {
  test('hlavní stránka posílá zvolený režim CSP s report-uri', async ({ request }) => {
    const h = (await request.get('/')).headers();
    const header = enforced ? 'content-security-policy' : 'content-security-policy-report-only';
    const other = enforced ? 'content-security-policy-report-only' : 'content-security-policy';
    const csp = h[header] ?? '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain('report-uri /api/csp-report');
    expect(h[other]).toBeUndefined();
  });

  test('/api/csp-report přijme hlášení a vrátí 204', async ({ request }) => {
    const res = await request.post('/api/csp-report', {
      data: '{"csp-report":{"violated-directive":"script-src"}}',
      headers: { 'content-type': 'application/csp-report' },
    });
    expect(res.status()).toBe(204);
  });
});

test('vynucující CSP zablokuje nepovolený externí skript', async ({ page }) => {
  test.skip(!enforced, 'Vyžaduje build s CSP_ENFORCE=true.');
  await page.route('https://untrusted.example/security-test.js', (route) =>
    route.fulfill({ contentType: 'text/javascript', body: 'window.untrustedScriptExecuted = true;' }));
  await page.goto('/');
  const violation = await page.evaluate(() => new Promise<{ directive: string; disposition: string }>((resolve) => {
    document.addEventListener('securitypolicyviolation', (event) => {
      if (event.blockedURI === 'https://untrusted.example/security-test.js') {
        resolve({ directive: event.effectiveDirective, disposition: event.disposition });
      }
    });
    const script = document.createElement('script');
    script.src = 'https://untrusted.example/security-test.js';
    document.head.appendChild(script);
  }));
  expect(violation).toEqual({ directive: 'script-src-elem', disposition: 'enforce' });
  expect(await page.evaluate(() => 'untrustedScriptExecuted' in window)).toBe(false);
});

test('CSP povolí Google Analytics až po souhlasu', async ({ page }) => {
  test.skip(!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, 'Vyžaduje build s testovacím GA ID.');
  let scriptRequests = 0;
  await page.route('https://www.googletagmanager.com/gtag/js?*', (route) => {
    scriptRequests += 1;
    return route.fulfill({ contentType: 'text/javascript', body: 'window.securityTestGoogleLoaded = true;' });
  });
  await page.route(/https:\/\/[^/]*(google-analytics\.com|analytics\.google\.com)\//, (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Povolit vše' })).toBeVisible();
  expect(scriptRequests).toBe(0);
  await page.getByRole('button', { name: 'Povolit vše' }).click();
  await expect.poll(() => scriptRequests).toBe(1);
  await expect.poll(() => page.evaluate(() => 'securityTestGoogleLoaded' in window)).toBe(true);
});

test.describe('Hashová CSP veřejných stránek', () => {
  test.skip(process.env.CSP_HASHES !== 'true', 'Vyžaduje build s CSP_HASHES=true.');

  for (const path of ['/', '/clanky', '/reference/zleby', '/sluzby/diamantove-lano', '/reference/neexistujici-csp-test']) {
    test(`${path} povoluje konkrétní inline hashe místo unsafe-inline`, async ({ request }) => {
      const response = await request.get(path);
      const header = enforced ? 'content-security-policy' : 'content-security-policy-report-only';
      const scriptPolicy = response.headers()[header]?.split(';').find(value => value.trim().startsWith('script-src '));
      expect(scriptPolicy).toContain("'sha256-");
      expect(scriptPolicy).not.toContain("'unsafe-inline'");
      const html = await response.text();
      for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (/\bsrc\s*=/i.test(attributes) || !content) continue;
        expect(scriptPolicy).toContain(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
      }
    });
  }

  test('cizí inline skript se zablokuje a hydratovaná cookie lišta funguje', async ({ page }) => {
    test.skip(!enforced, 'Vyžaduje vynucující CSP.');
    await page.goto('/');
    await page.getByRole('button', { name: 'Odmítnout', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Odmítnout', exact: true })).toHaveCount(0);
    const violation = await page.evaluate(() => new Promise<string>(resolve => {
      document.addEventListener('securitypolicyviolation', event => {
        if (event.blockedURI === 'inline') resolve(event.disposition);
      });
      const script = document.createElement('script');
      script.textContent = 'window.untrustedInlineExecuted = true;';
      document.head.appendChild(script);
    }));
    expect(violation).toBe('enforce');
    expect(await page.evaluate(() => 'untrustedInlineExecuted' in window)).toBe(false);
  });
});

test.describe('Nonce CSP administrace', () => {
  test.skip(process.env.CSP_NONCES !== 'true', 'Vyžaduje build s CSP_NONCES=true.');

  test('nonce odpovídá framework skriptům, mění se a nelze podvrhnout', async ({ request }) => {
    const header = enforced ? 'content-security-policy' : 'content-security-policy-report-only';
    const nonces = [];
    for (let i = 0; i < 2; i++) {
      const response = await request.get('/sprava/prihlaseni', { headers: {
        'x-nonce': 'attacker', 'content-security-policy': "script-src 'nonce-attacker'",
      } });
      expect(response.status()).toBe(200);
      const policy = response.headers()[header] ?? '';
      const scriptPolicy = policy.split(';').find(value => value.trim().startsWith('script-src ')) ?? '';
      expect(scriptPolicy).not.toContain("'unsafe-inline'");
      const nonce = scriptPolicy.match(/'nonce-([^']+)'/)?.[1];
      expect(nonce).toMatch(/^[A-Za-z0-9+/]{22}==$/);
      expect(nonce).not.toBe('attacker');
      nonces.push(nonce);
      expect(response.headers()['cache-control']).toContain('no-store');
      const html = await response.text();
      let scripts = 0;
      for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
        if (!content || /type="application\/ld\+json"/i.test(attributes)) continue;
        expect(attributes).toContain(`nonce="${nonce}"`);
        scripts += 1;
      }
      expect(scripts).toBeGreaterThan(0);
    }
    expect(nonces[0]).not.toBe(nonces[1]);
  });

  test('přihlašovací klient se hydratuje a blokuje cizí inline skript', async ({ page }) => {
    test.skip(!enforced, 'Vyžaduje vynucující CSP.');
    await page.goto('/sprava/prihlaseni');
    await expect(page.getByRole('button', { name: 'Přihlásit přes Google' })).toBeVisible();
    const violation = await page.evaluate(() => new Promise<string>(resolve => {
      document.addEventListener('securitypolicyviolation', event => {
        if (event.blockedURI === 'inline') resolve(event.disposition);
      });
      const script = document.createElement('script');
      script.textContent = 'window.adminInjectedScript = true;';
      document.head.appendChild(script);
    }));
    expect(violation).toBe('enforce');
    expect(await page.evaluate(() => 'adminInjectedScript' in window)).toBe(false);
    await page.route('**/api/auth/**', route => route.fulfill({ json: {} }));
    const request = page.waitForRequest('**/api/auth/providers');
    await page.getByRole('button', { name: 'Přihlásit přes Google' }).click();
    await request;
  });
});

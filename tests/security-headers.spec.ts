import { test, expect } from '@playwright/test';

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

import { test, expect } from '@playwright/test';

// Bezpečnostní hlavičky z next.config.ts headers(). CSP tu záměrně není (zavádí se zvlášť).
test.describe('Security headers', () => {
  for (const path of ['/', '/clanky', '/sluzby/diamantove-lano', '/api/send']) {
    test(`hlavičky na ${path}`, async ({ request }) => {
      const res = await request.get(path);
      const h = res.headers();
      expect(h['x-content-type-options']).toBe('nosniff');
      expect(h['x-frame-options']).toBe('SAMEORIGIN');
      expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(h['strict-transport-security']).toMatch(/max-age=\d+/);
      expect(h['permissions-policy']).toContain('camera=()');
    });
  }
});

test.describe('Content-Security-Policy (Report-Only)', () => {
  test('hlavní stránka posílá CSP v režimu Report-Only s report-uri', async ({ request }) => {
    const h = (await request.get('/')).headers();
    const csp = h['content-security-policy-report-only'] ?? '';
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'self'");
    expect(csp).toContain('report-uri /api/csp-report');
    // vynucující CSP tu zatím být nemá – nejdřív sledujeme hlášení
    expect(h['content-security-policy']).toBeUndefined();
  });

  test('/api/csp-report přijme hlášení a vrátí 204', async ({ request }) => {
    const res = await request.post('/api/csp-report', {
      data: '{"csp-report":{"violated-directive":"script-src"}}',
      headers: { 'content-type': 'application/csp-report' },
    });
    expect(res.status()).toBe(204);
  });
});

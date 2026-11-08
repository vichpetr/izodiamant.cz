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

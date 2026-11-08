// Smoke test skutečného Workeru (OpenNext) – Playwright běží proti `next start`, takže
// nezachytí chyby, které vzniknou až v Workers runtime (např. po aktualizaci Next/OpenNext
// padaly všechny dynamické cesty na 500 "preview-props.json", 2026-11-08).
// Předpoklad: hotový `npm run build:worker` (.open-next/). Spuštění: `npm run smoke:worker`.

import { spawn } from 'node:child_process';

const PORT = 8799;
const BASE = `http://localhost:${PORT}`;

const checks = [
  { name: 'GET /', req: ['/'], expect: 200 },
  { name: 'GET /sprava (redirect na přihlášení)', req: ['/sprava', { redirect: 'manual' }], expect: 307 },
  { name: 'POST /api/csp-report', req: ['/api/csp-report', { method: 'POST', body: '{"a":1}', headers: { 'content-type': 'application/csp-report' } }], expect: 204 },
  { name: 'POST /api/send (prázdná data = validace, ne 500)', req: ['/api/send', { method: 'POST', body: '{}', headers: { 'content-type': 'application/json' } }], expect: 400 },
];

const dev = spawn('npx', ['wrangler', 'dev', '--config', 'wrangler.toml', '--port', String(PORT), '--local'], {
  stdio: ['ignore', 'pipe', 'pipe'],
});
let log = '';
dev.stdout.on('data', (d) => (log += d));
dev.stderr.on('data', (d) => (log += d));

async function waitUp() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE + '/');
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return false;
}

let failed = false;
try {
  if (!(await waitUp())) throw new Error('wrangler dev nenaběhl do 2 minut');
  for (const c of checks) {
    const res = await fetch(BASE + c.req[0], c.req[1]);
    const ok = res.status === c.expect;
    if (!ok) failed = true;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${c.name}: ${res.status} (čekáno ${c.expect})`);
  }
} catch (e) {
  failed = true;
  console.error(String(e));
} finally {
  dev.kill('SIGTERM');
}
if (failed) {
  console.error('\n--- log wrangler dev (posledních 40 řádků) ---\n' + log.split('\n').slice(-40).join('\n'));
  process.exit(1);
}

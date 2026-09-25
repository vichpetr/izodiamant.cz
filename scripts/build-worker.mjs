// Build pro Cloudflare Workers (OpenNext) → .open-next/
//
// Přechodné období: web se staví i pro Cloudflare Pages (@cloudflare/next-on-pages),
// který u dynamických rout vyžaduje `export const runtime = 'edge'`. OpenNext edge
// runtime naopak nepodporuje. Proto tu ty řádky před buildem dočasně odstraníme
// (routy pak běží v Node.js runtime Workeru) a po buildu vrátíme zpět.
// Po smazání Pages projektu: řádky smazat ze zdrojů a tenhle skript nahradit
// přímo `opennextjs-cloudflare build`.

import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const EDGE_LINE = /^export const runtime = ['"]edge['"];?\r?\n/m;

function* sourceFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) yield path;
  }
}

const originals = new Map();
for (const file of sourceFiles('src/app')) {
  const source = readFileSync(file, 'utf8');
  if (EDGE_LINE.test(source)) {
    originals.set(file, source);
    writeFileSync(file, source.replace(EDGE_LINE, ''));
  }
}
console.log(`build-worker: dočasně bez runtime='edge' v ${originals.size} souborech`);

let status = 1;
try {
  const result = spawnSync('npx', ['opennextjs-cloudflare', 'build'], { stdio: 'inherit' });
  status = result.status ?? 1;
} finally {
  for (const [file, source] of originals) writeFileSync(file, source);
}
process.exit(status);

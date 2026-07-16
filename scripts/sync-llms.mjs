// Generuje src/lib/llms.ts z public/llms.txt.
// public/llms.txt je jediný zdroj pravdy; middleware (edge runtime) nemá přístup
// k souborovému systému, proto z něj potřebuje vloženou konstantu.
// Spusť `npm run sync:llms` po každé úpravě public/llms.txt.
// Shodu obou souborů hlídá test v tests/audit.spec.ts.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const md = readFileSync(join(root, 'public/llms.txt'), 'utf-8');

// Escapovat v tomto pořadí: zpětné lomítko → backtick → ${ (interpolace).
const escaped = md
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const out = `// Jediný zdroj pravdy pro obsah llms.txt.
// Musí zůstat shodný s public/llms.txt, který se servíruje jako statický soubor –
// hlídá to test v tests/audit.spec.ts. Middleware běží na edge a nemá přístup k fs,
// proto je obsah vložen jako konstanta.
//
// NEUPRAVUJ ručně – generováno příkazem \`npm run sync:llms\` z public/llms.txt.
export const LLMS_MD = \`${escaped}\`;
`;

writeFileSync(join(root, 'src/lib/llms.ts'), out);
console.log('✓ src/lib/llms.ts vygenerován z public/llms.txt');

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const openNextRequire = createRequire(import.meta.resolve('@opennextjs/cloudflare'));
const eslintRequire = createRequire(import.meta.resolve('typescript-eslint'));

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'izodiamant-build-deps-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('OpenNext glob supports synchronous and async discovery, dotfiles and ignores', async t => {
  const root = fixture(t);
  mkdirSync(join(root, 'nested'));
  for (const name of ['entry.ts', '.hidden.ts', 'nested/ignored.ts']) {
    writeFileSync(join(root, name), 'export {};');
  }
  const { glob, globSync } = openNextRequire('glob');
  const options = { cwd: root, dot: true, nodir: true, ignore: ['nested/**'] };
  const expected = ['.hidden.ts', 'entry.ts'];
  assert.deepEqual(globSync('**/*.ts', options).sort(), expected);
  assert.deepEqual((await glob('**/*.ts', options)).sort(), expected);
});

test('TypeScript ESLint project service respects the minimatch default-project allowlist', t => {
  const root = fixture(t);
  writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ files: ['included.ts'] }));
  writeFileSync(join(root, 'included.ts'), 'export {};');
  const code = 'export const answer: number = 42;';
  writeFileSync(join(root, 'default.ts'), code);
  writeFileSync(join(root, 'blocked.ts'), code);
  const { parseAndGenerateServices } = eslintRequire('@typescript-eslint/typescript-estree');
  const options = {
    tsconfigRootDir: root,
    projectService: { allowDefaultProject: ['default.ts'], defaultProject: 'tsconfig.json' },
  };
  const parsed = parseAndGenerateServices(code, { ...options, filePath: join(root, 'default.ts') });
  assert.equal(parsed.ast.type, 'Program');
  assert.ok(parsed.services.program.getSourceFile(join(root, 'default.ts')));
  assert.throws(() => parseAndGenerateServices(code, { ...options, filePath: join(root, 'blocked.ts') }),
    /was not found by the project service/);
});

// ESLint 9 flat config (nahrazuje .eslintrc.json).
// Next 16 už neposkytuje `next lint`; lintujeme přímo přes ESLint,
// který od verze 9 vyžaduje tento formát a soubory z eslint-config-next
// exportované jako pole (core-web-vitals + typescript).
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'worker/**',
      'test-results/**',
      'playwright-report/**',
      'next-env.d.ts',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

if (process.env.CSP_HASHES === 'true') {
  const root = join(process.cwd(), '.next');
  const manifestPath = join(root, 'routes-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const prerender = JSON.parse(readFileSync(join(root, 'prerender-manifest.json'), 'utf8'));
  const baseHeader = manifest.headers.flatMap(rule => rule.headers).find(header =>
    ['content-security-policy', 'content-security-policy-report-only'].includes(header.key.toLowerCase()));
  if (!baseHeader) throw new Error('Missing base CSP header');
  const fallbackHashes = new Set();
  for (const name of ['_not-found', '_global-error']) {
    const html = readFileSync(join(root, 'server', 'app', `${name}.html`), 'utf8');
    for (const [, attributes, content] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (!/\bsrc\s*=/i.test(attributes) && content.length > 0) {
        fallbackHashes.add(`'sha256-${createHash('sha256').update(content).digest('base64')}'`);
      }
    }
  }
  if (fallbackHashes.size === 0) throw new Error('No error page CSP hashes found');
  let count = 0;
  for (const [route, entry] of Object.entries(prerender.routes)) {
    if (entry.routeType !== 'page' || route.startsWith('/_')) continue;
    const file = join(root, 'server', 'app', route === '/' ? 'index.html' : `${route.slice(1)}.html`);
    const html = readFileSync(file, 'utf8');
    const hashes = [...new Set([...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(([, attributes, content]) => !/\bsrc\s*=/i.test(attributes) && content.length > 0)
      .map(([, , content]) => `'sha256-${createHash('sha256').update(content).digest('base64')}'`))];
    if (hashes.length === 0) throw new Error(`No inline scripts found for ${route}`);
    const policy = baseHeader.value.split(';').map(directive => {
      if (!directive.trim().startsWith('script-src ')) return directive;
      return directive.replace("'unsafe-inline'", hashes.join(' '));
    }).join(';');
    if (Buffer.byteLength(policy) > 16000) throw new Error(`CSP exceeds header budget: ${route}`);
    const escaped = [...route].map(char => '^$.*+?()[]{}|'.includes(char) || char.charCodeAt(0) === 92
      ? String.fromCharCode(92) + char : char).join('');
    manifest.headers.push({ source: route, regex: `^${escaped}/?$`, headers: [{ key: baseHeader.key, value: policy }] });
    count += 1;
  }
  if (count === 0) throw new Error('No prerendered pages received CSP hashes');
  baseHeader.value = baseHeader.value.split(';').map(directive =>
    directive.trim().startsWith('script-src ')
      ? directive.replace("'unsafe-inline'", [...fallbackHashes].join(' ')) : directive).join(';');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`CSP hashes generated for ${count} prerendered pages`);
}

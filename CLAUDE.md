# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve production build (Playwright's webServer uses this)
- `npm run lint` — ESLint (`next/core-web-vitals` + `next/typescript`)
- `npm test` — runs Playwright suite against `npm run start` on port 3000 (build first)
- `npx playwright test tests/seo.spec.ts` — run a single spec file
- `npx playwright test --project=mobile-chrome` — run one device project (`desktop-chrome`, `tablet-chrome`, `mobile-chrome`)

## Required environment

Strict mode — the app throws on boot if these are missing:

- `RESEND_API_KEY` — server-side, used by `src/app/api/send/route.ts`
- `NEXT_PUBLIC_REVIEWS_API_URL` — Cloudflare Worker that proxies Firmy.cz reviews
- `NEXT_PUBLIC_FIRMY_PROFILE_URL` — public Firmy.cz profile URL
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — optional; GA only mounts when set

## Architecture

**Next.js 16 App Router + Tailwind 3.4 + TS strict.** Single-locale (cs-CZ) marketing site for a Czech masonry remediation company.

**Content lives in `src/data/*.json`**, not in components. Edit JSON to change copy, prices, references, FAQ, cities, fallback reviews. Pages import these directly at build time.

**Routing:**
- `/` (`src/app/page.tsx`) is the long scroll: Hero, About, Technology, Services, References, Reviews, Calculator, FAQ, Contact.
- `/sluzby/{diamantove-lano,retezova-pila,chemicka-injektaz}` — per-service detail pages.
- `/reference/[id]` — single project detail, ID matches `references.json`.
- `/mesta` + `/mesta/[slug]` — city landing pages driven by `mesta.json` (SEO long-tail).
- `next.config.ts` declares legacy redirects (`/reference`, `/sluzby`, `/kontakt`, old service slugs, `/category/reference`) — preserve them when restructuring URLs.

**Reviews integration ("Proxy API" pattern):** Components `FirmyBadge` and `HomeReviews` fetch live data from the Cloudflare Worker at `NEXT_PUBLIC_REVIEWS_API_URL`. Worker source is in `deployment.MD`. `src/data/reviews.json` is the static fallback when the worker errors.

**Agent / LLM discovery layer** is unusually prominent and intentional:
- `src/middleware.ts` content-negotiates `Accept: text/markdown` on any page and serves an inline `LLMS_MD` snippet. Keep this snippet in sync with `public/llms.txt` if either changes.
- `next.config.ts` `headers()` and `public/_headers` (Cloudflare Pages) advertise `Link: rel="service-doc" | "api-catalog" | "openid-configuration" | "oauth-protected-resource" | "agent-card"`. Same set is mirrored as `<link>` tags in `src/app/layout.tsx`.
- `<WebMCP />` mounts a Web-MCP shim in the layout.
- The middleware matcher excludes `api`, `_next/static`, `_next/image`, `.well-known`, `favicon.ico` — `.well-known/*` files are served as static assets from `public/`.

**Forms:** `ContactForm` uses `react-hook-form` + `zod` and POSTs to `/api/send`, which uses Resend (`@react-email/render` for the template). The route is the only server-side endpoint in the project.

**Consent / GA:** Consent Mode v2 is initialized inline in `layout.tsx` before any GA tag, gated by `localStorage['cookie-consent']`. `CookieConsent` component updates that flag; GA component only mounts if the env var is present.

**Schema.org `LocalBusiness` JSON-LD** is injected from `layout.tsx`. Per-page schema (Service, FAQPage, BreadcrumbList) is added inline in the relevant page files.

**Styling:** Tailwind 3.4 (note: `@tailwindcss/postcss` v4 is in deps but config is v3.4 syntax in `tailwind.config.ts`). `src/lib/utils.ts` exports `cn()` (`clsx` + `tailwind-merge`). Framer Motion is wrapped in `MotionProvider`; pre-optimized via `experimental.optimizePackageImports`.

**Tests** are Playwright-only — `tests/seo.spec.ts` (meta tags, structured data, canonical URLs), `tests/layout.spec.ts`, `tests/performance.spec.ts`, `tests/visual-integrity.spec.ts`, `tests/runtime.spec.ts`. Each spec runs across the three device projects in `playwright.config.ts`. `npm run start` is started automatically; build before running tests in CI.

## SEO conventions (enforced)

From `GEMINI.md` — apply when editing any metadata or page copy:

- Meta titles ≤ ~580px (55–60 chars), format `[Short Title] | IZODIAMANT`.
- Brand promise **"Vracíme zdraví vaší stavbě."** (with the period) must appear in: root `layout.tsx` description, Hero description, Footer description, and reference page meta descriptions.
- **Forbidden phrase:** `s doživotní zárukou` — never use it anywhere.
- Reference page meta description pattern: `Sanace zdiva: [Title]. [Location]. Vracíme zdraví vaší stavbě.`
- Image `alt` text should reference masonry remediation and the specific technology.

## Deployment

Cloudflare Pages (frontend) + a separate Cloudflare Worker (reviews API). `@cloudflare/next-on-pages` is in devDependencies. Full procedure including Worker source code lives in `deployment.MD`.

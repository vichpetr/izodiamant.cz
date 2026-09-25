# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve production build (Playwright's webServer uses this)
- `npm run build:worker` — Cloudflare Workers build via OpenNext → `.open-next/` (see Deployment)
- `npm run preview:worker` — build + run the Worker locally in workerd (`wrangler.toml` env `preview`)
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, rulesets `next/core-web-vitals` + `next/typescript`); runs `eslint .` directly, **not** `next lint` (removed in Next 16)
- `npm run sync:llms` — regenerate `src/lib/llms.ts` from `public/llms.txt` (run after editing the latter)
- `npm test` — runs Playwright suite against `npm run start` on port 3000 (build first)
- `npx playwright test tests/seo.spec.ts` — run a single spec file
- `npx playwright test --project=mobile-chrome` — run one device project (`desktop-chrome`, `tablet-chrome`, `mobile-chrome`)

## Required environment

Strict mode — the app throws on boot if these are missing:

- `RESEND_API_KEY` — server-side, used by `src/app/api/send/route.ts`
- `NEXT_PUBLIC_REVIEWS_API_URL` — Cloudflare Worker that proxies Firmy.cz reviews
- `NEXT_PUBLIC_FIRMY_PROFILE_URL` — public Firmy.cz profile URL
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — optional; GA only mounts when set

**CAPTCHA (Cloudflare Turnstile)** — optional, protects the contact form + calculator.
Both are needed to actually enforce it; without them the forms work uncaptcha'd (graceful
degradation). Set the pair together:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — public site key; `Turnstile.tsx` renders the widget
  only when set, and the two forms then require a token before submit.
- `TURNSTILE_SECRET_KEY` — server secret; `/api/send` verifies the token via Cloudflare
  `siteverify` only when set. If the widget is shown but this is unset, tokens aren't
  checked, so keep the two in sync.

**Admin section `/sprava`** (hidden CRM — see `deployment.MD`). Only needed to run that
feature; the public site works without them. `/sprava` degrades gracefully (shows login,
no 500) when unset:

- `AUTH_SECRET` — Auth.js JWT signing secret (random)
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth 2.0 web client
- `AUTH_URL` — canonical origin, e.g. `https://izodiamant.cz`
- `ADMIN_EMAILS` — comma-separated allowlist of Google accounts that may sign in
- **Cloudflare D1 binding `DB`** — in `wrangler.toml`; schema in `db/schema.sql`. Accessed via `getCfEnv()` (`src/lib/cfEnv.ts` → `src/lib/db.ts`, degrades to empty/no-op when absent).
- **Service binding `QUOTES`** — `wrangler.toml` → `izodiamant-quotes` (production) / `izodiamant-quotes-preview` (preview). Needed by `/sprava/nabidky` for PDF, AI and mailbox; without it the section degrades to a plain form (`src/lib/quotesWorker.ts`).

## Coupled invariants

Several facts (prices, SEO metadata, JSON-LD, marketing claims, redirects, `llms.txt`)
live in more than one file and must stay in sync. Before editing any of those, load the
**`site-invariants`** skill (`.claude/skills/site-invariants/SKILL.md`) — it lists each
coupling, the files involved, and how to keep them together. `tests/audit.spec.ts`
enforces them.

## Architecture

**Next.js 16 App Router + Tailwind 3.4 + TS strict.** Single-locale (cs-CZ) marketing site for a Czech masonry remediation company.

**Content lives in `src/data/*.json`**, not in components. Edit JSON to change copy, prices, references, FAQ, cities, fallback reviews. Pages import these directly at build time.

**Routing:**
- `/` (`src/app/page.tsx`) is the long scroll: Hero, About, Technology, Services, References, Reviews, Calculator, FAQ, Contact.
- `/sluzby/{diamantove-lano,retezova-pila,chemicka-injektaz}` — per-service detail pages.
- `/reference` — archive of all references, grouped by year, paginated. Page 1 lives at
  `/reference`, further pages at `/reference/strana/[cislo]` (SSG). Page size, sorting and
  the year grouping come from `src/lib/references.ts` — change them there, not in the pages;
  `sitemap.ts` derives the paginated URLs from the same helpers. The homepage `#reference`
  section only shows the 3 newest cards and links here.
- `/reference/[id]` — single project detail, ID matches `references.json`.
- `/doporuc-a-ziskej-odmenu` — referral program page.
- `/sprava/nabidky` — admin: price quotes (list, and a 3-step wizard via `?id=…&krok=1|2|3`; one route; the wizard step is a query param). Domain logic
  (model, price math, PDF HTML template) lives in `src/lib/quotes/` and is shared with
  `quotes-worker/` via relative imports — **no `@/` aliases there**. Prices are always computed
  by `computeTotals()`, never by AI.
- `next.config.ts` declares legacy redirects (`/sluzby`, `/kontakt`, old service slugs,
  `/category/reference` → `/reference`, `/reference/strana/1` → `/reference`, `/clanky`,
  `/mesta`) — preserve them when restructuring URLs. Note `/reference` is a real page now,
  not a redirect to `/#reference`.

**Reviews integration ("Proxy API" pattern):** Components `HeroBadges`, `FirmyBadge`, `HomeReviews` and `ProjectReview` fetch live data from the Cloudflare Worker at `NEXT_PUBLIC_REVIEWS_API_URL`. Worker source is in `deployment.MD`. **There is no per-review static fallback** — `HomeReviews`/`ProjectReview` render **nothing** when the worker is unavailable or has no matching review (owner's call: better empty than stale/unreal data). Locally the placeholder URL (`…vás-účet…`) is skipped, so reviews only appear on production with a real worker URL. (The aggregate rating/count badge is separate — `useReviewSummary` still degrades to `firmy.json`.)

- **Multi-source, source-aware.** Reviews carry a `source` (`firmy` = Mapy.com, `google`). The new worker returns per-source aggregates in `sources.{firmy,google}` and per-review `source`; the summary hook `src/lib/useReviewSummary.ts` reads that and gracefully degrades on the old worker (top-level `rating`/`count` = Mapy.com only, no Google). **Google reviews/badge only appear once the worker is redeployed with `GOOGLE_PLACE_ID` + `GOOGLE_API_KEY`** (see `deployment.MD`).
- **Review IDs are prefixed** `firmy-…` / `google-…`. `references.json` `reviewId` uses the same prefixed form; `ProjectReview` matches by prefix-stripped id (`normId`) so pairing survives the old worker's non-prefixed ids too. Keep `reviewId` in step with the **live worker** ids — pairing only works when the worker returns a review whose `normId` matches (no static fallback to catch mismatches).
- Long review text is clamped by `ExpandableText` (char-threshold based, not DOM measurement — reliable under async load).

**Agent / LLM discovery layer** is unusually prominent and intentional:
- `src/middleware.ts` content-negotiates `Accept: text/markdown` on any page and serves the `LLMS_MD` constant from `src/lib/llms.ts`. **`public/llms.txt` is the source of truth; `src/lib/llms.ts` is generated** — edit the former and run `npm run sync:llms`. A test in `tests/audit.spec.ts` fails if they drift.
- `src/middleware.ts` (on `/`) and `public/_headers` (static assets) advertise `Link: rel="service-doc" | "api-catalog" | "openid-configuration" | "oauth-protected-resource" | "agent-card"`. Same set is mirrored as `<link>` tags in `src/app/layout.tsx`.
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

**Cloudflare Worker `izodiamant`** via OpenNext (`@opennextjs/cloudflare`) + separate workers for reviews and quotes. (Until 2026-09 the site ran on Cloudflare Pages / `next-on-pages`; that's gone — don't reintroduce `runtime = 'edge'`, `getRequestContext` or `_worker.js`-style config.) Setup: `deployment.MD` §1.

- **Config:** `wrangler.toml` — worker `izodiamant` (custom domains `izodiamant.cz` + `www`) and env `preview` → `izodiamant-preview` with its own D1 and quotes-worker binding. `routes` is inheritable, so `[env.preview]` sets `routes = []` explicitly — keep it, or preview would claim the production domains. **Keep the root config TOML, never `wrangler.json(c)`:** wrangler looks for json → jsonc → toml, each name up the whole directory tree, so a root `wrangler.jsonc` shadows `quotes-worker/wrangler.toml` and `worker/wrangler.toml` (their deploys would pick up the web config). `open-next.config.ts` serves prerendered pages from static assets (no KV/R2 cache).
- **Deploy:** `.github/workflows/deploy-web.yml` only (master → production, other branches → preview version with a per-branch alias, daily 04:10 UTC cron rebuild for scheduled articles). Don't enable Cloudflare's Git integration (Workers Builds) — it would be a second, broken pipeline. Deploy with `opennextjs-cloudflare deploy/upload`, not bare `wrangler deploy` — only the former populates the SSG page cache.
- **Env:** `NEXT_PUBLIC_*` are baked in at build time from GitHub **Environments** `production` / `preview` (falls back to repo Variables); server secrets live in the worker (`wrangler secret put --env=""`, preview `wrangler versions secret put --env preview`).
- **Bindings** only via `getCfEnv()` (`src/lib/cfEnv.ts`) — never call `getCloudflareContext()` directly. It returns null under `next dev` / `next start`, and callers degrade.
- **`esbuild` is a direct devDependency pinned to the version `@opennextjs/aws` uses** — OpenNext imports esbuild without declaring it, so it would otherwise resolve whatever is hoisted (e.g. wrangler's) and the build can fail with "Invalid alias name". Bump it together with `@opennextjs/cloudflare`.

**Quotes Worker** lives in `quotes-worker/` (TypeScript, `wrangler.toml` with `production` + `[env.preview]`, each with its own D1 + R2 + queue). Does PDF (Browser Rendering), AI (inbox triage, attachment relevance, reading plans and bills of quantities / výkaz výměr, e-mail text), filling the client's xlsx výkaz (`src/vykaz.ts`, in-place XML patch via fflate), PDF versioning (`quote_versions`) and IMAP/SMTP to the Seznam mailbox (cron). AI model per task is `<provider>:<model>` in `wrangler.toml` (`zen:` = OpenCode Zen, secret `OPENCODE_API_KEY`; `cf:` = Workers AI fallback) – see `src/ai.ts`; every call is logged to `ai_usage`. Deployed by `.github/workflows/deploy-quotes-worker.yml` (master → production, other branches → preview; applies `db/schema.sql` and the `ALTER TABLE`s in `db/migrations/`). Setup and mailbox config: `deployment.MD` §3.

**Reviews Worker** lives in `worker/` (`worker/src/index.js` is the single source of truth, `worker/wrangler.toml` the config) and **auto-deploys** via `.github/workflows/deploy-worker.yml` on any push to `master` under `worker/**`. Non-secret config (`FIRMY_PROFILE_URL`, `GOOGLE_PLACE_ID`) is in `wrangler.toml [vars]`; `GOOGLE_API_KEY` is a Cloudflare secret (persists across deploys). CI needs repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`. Full procedure in `deployment.MD`.

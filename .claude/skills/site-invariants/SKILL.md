---
name: site-invariants
description: >
  Coupling rules for izodiamant.cz that must stay in sync across files.
  Load BEFORE editing prices or units, SEO metadata / og:url, schema.org JSON-LD,
  marketing claims or the "Vracíme zdraví vaší stavbě" slogan, URL redirects/routes,
  llms.txt, or before adding a new page. Also load when a change touches
  src/data/*.json, src/app/layout.tsx, src/lib/seo.ts, src/lib/llms.ts,
  next.config.ts, or public/llms.txt.
---

# Site invariants (izodiamant.cz)

Several facts on this site live in **more than one file**. Change one copy and the
others silently drift — usually invisibly, because the divergence only shows up to a
search engine, an AI crawler, or a customer. Each rule below lists the coupled files,
what must hold, and how to keep them together. `tests/audit.spec.ts` is the backstop —
run it after any change here (`npx playwright test tests/audit.spec.ts`).

Content lives in `src/data/*.json`, not in components (see CLAUDE.md). These rules are
about the couplings *between* those files and the code that consumes them.

---

## 1. Prices are per **bm** at a 45 cm reference thickness

**Files:** `src/data/services.json` · `src/data/calculator.json` ·
`src/components/PricingCalculator.tsx` · `src/data/faq.json` · `public/llms.txt`

- Every price is quoted **per běžný metr (bm)**, never per m². The calculator rate is
  the price at **`REFERENCE_THICKNESS_CM = 45`** (`PricingCalculator.tsx`); it scales
  `× (thickness / 45) × length`. So `services.json` "od 4 500 Kč / bm" must equal what
  the calculator shows for 1 bm at 45 cm. If you change a rate in `calculator.json`,
  change the matching `services.json` string and the FAQ price answer and `llms.txt`.
- **`calculator.json` rows have no `unit` field.** All rates share the bm/45 cm model;
  a `unit` key would resurrect the old m²-vs-bm split that made injektáž cost more than
  diamond wire. Don't add it back.
- **VAT:** the firm is **not a VAT payer**. Copy says **"Nejsme plátci DPH"**, never
  "Bez DPH" (which implies VAT gets added). Check `Footer.tsx`, `PricingCalculator.tsx`
  badge, `faq.json`, `llms.txt`.

## 2. `public/llms.txt` and `src/lib/llms.ts` are one source, two copies

**Files:** `public/llms.txt` (source of truth) · `src/lib/llms.ts` (generated) ·
`src/middleware.ts` (consumes `LLMS_MD`)

The middleware runs on the edge and can't read the filesystem, so it imports the text
as a constant. **Edit `public/llms.txt`, then run `npm run sync:llms`** to regenerate
`src/lib/llms.ts`. Never hand-edit `src/lib/llms.ts`. Keep prices, FAQ, and NAP in
`llms.txt` consistent with rules 1 and 4. Enforced by the "llms.txt je shodný" test.

## 3. Structured data (JSON-LD) must render in **server HTML**

**Files:** `src/app/layout.tsx` (LocalBusiness) · `src/app/sluzby/*/page.tsx` (Service) ·
`src/components/FAQ.tsx` (FAQPage) · `src/components/ProjectReview.tsx` (Review)

- Emit JSON-LD as a plain `<script type="application/ld+json" dangerouslySetInnerHTML=…>`.
  **Never** via `next/script` with `strategy="afterInteractive"` — that injects it only
  after hydration, so crawlers without JS (Seznam, many AI bots) never see it. This was
  the actual cause of an audit's "no schema.org markup found".
- `LocalBusiness` in `layout.tsx` carries `aggregateRating` from `src/data/firmy.json`
  (`firmyData.rating` / `.count`). If the rating source changes, keep both in step.
- **No `openingHoursSpecification`.** The firm works **by appointment, with no fixed
  hours** — do not add opening hours (owner-confirmed). Publishing invented hours would
  turn customers away outside them.

## 4. Metadata & `og:url` go through the `pageMetadata()` helper

**Files:** `src/lib/seo.ts` · every `src/app/**/page.tsx`

- New pages should build metadata with `pageMetadata({ path, title, description, images })`
  from `src/lib/seo.ts`. It sets a **per-page** `og:url` + canonical and a full
  `openGraph`. This exists because Next.js does **not** deep-merge `openGraph`: a page
  that sets it without `url`/`siteName` drops the layout's values and pins `og:url` to
  the homepage.
- If you hand-roll `openGraph` instead (as the `/mesta` pages do), you **must** include
  `url`, `siteName`, `locale`, and `type`, or og:url regresses to `/`.
- Meta title format stays `[Short Title] | IZODIAMANT`; the `| IZODIAMANT` suffix comes
  from the layout `title.template`, so pass the short title **without** it (avoids a
  doubled suffix). See also the SEO conventions in CLAUDE.md.

## 5. Every page is in the sitemap

**Files:** `src/app/sitemap.ts`

Add each new route to `sitemap.ts`. Data-driven collections (`references.json`,
`mesta.json`) are mapped there already — a new static page is not. Enforced indirectly
by the redirect/route tests.

## 6. Old URLs get 301s — but never shadow a real page

**File:** `next.config.ts` (`redirects()`)

- When you rename or remove a route, add a permanent redirect for the old path so the
  previous WordPress URLs (still indexed) don't 404 or create duplicate content.
- **Never** a catch-all like `/sluzby/:slug*` → it runs before filesystem routes and
  would swallow the real `/sluzby/diamantove-lano` etc. Redirect specific old slugs
  instead. The "skutečné stránky služeb zůstávají dostupné" test guards this.

## 7. Claims stay verifiable; the slogan stays in its lane

**Files:** service pages, `src/data/references.json`, `src/data/faq.json`, `llms.txt`,
components

- No unfalsifiable superlatives: avoid "vydrží navždy", "nikdy nevrátí",
  "neprostupná / nepřekonatelná bariéra", "absolutní špička", "100% jistota". Prefer
  concrete, defensible claims ("životnost přesahující 50 let", "souvislá bariéra").
- The brand promise **"Vracíme zdraví vaší stavbě."** belongs in header/footer and the
  meta descriptions CLAUDE.md lists — **not** repeated through body copy or technical
  fields (e.g. a "Záruka" box must state a warranty, not the slogan). The
  "nedoložitelná tvrzení" and slogan-count tests enforce both.
- Place names and NAP (Name/Address/Phone) must be spelled identically everywhere
  (site, `llms.txt`, JSON-LD) and match Firmy.cz + Google Business Profile.

---

### After changing anything above
```
npm run sync:llms        # only if you touched public/llms.txt
npm run lint             # ESLint 9 flat config (eslint.config.mjs), not `next lint`
npx tsc --noEmit
npx playwright test tests/audit.spec.ts
```

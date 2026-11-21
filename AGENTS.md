# AGENTS.md

Pokyny pro kódovací agenty (Claude, Codex). Podrobnosti o architektuře a příkazech jsou v [CLAUDE.md](CLAUDE.md), nasazení v [deployment.MD](deployment.MD).

## Project profile
- Tasks: Notion databáze "Úkoly – nálezy z kontrol" (Weby / Izodiamant), bez prefixu ID. Úkol se identifikuje klíčem nálezu (`Klíč nálezu`, např. `bezpecnost/csp-vynucovani`); ten je i názvem větve a v commitu `[<klíč nálezu>] <popis>`.
- Stack: Next.js 16 (App Router) + React + TypeScript strict + Tailwind 3.4; Auth.js (admin `/sprava`); Resend (e-maily); Playwright. Pomocné Workery: `worker/` (JS, živé recenze Firmy.cz a Google) a `quotes-worker/` (TypeScript, PDF, AI, IMAP/SMTP).
- Database: Cloudflare D1 (SQLite). Schéma `db/schema.sql` (idempotentní), změny existujících tabulek jako `ALTER TABLE` v `db/migrations/*.sql`. Spouští se `npm run db:schema:remote` (produkce `izodiamant-db`) a `npm run db:schema:preview:remote` (`izodiamant-preview-db`); quotes-worker aplikuje schéma a migrace ve svém CI. Další D1/R2/fronta má quotes-worker (`production` + `preview`).
- Hosting / deploy: Cloudflare. Cíl je Worker přes OpenNext (`wrangler.jsonc`, `.github/workflows/deploy-web.yml`: master → produkce `izodiamant`, ostatní větve → `izodiamant-preview`, denní rebuild 04:10 UTC). Doména izodiamant.cz zatím obsluhuje starší Cloudflare Pages (next-on-pages, Git integrace) – dokud se nepřepne, musí kód stavět obě cesty. `worker/` se nasazuje `deploy-worker.yml`, `quotes-worker/` `deploy-quotes-worker.yml` (master → produkce, jinak preview). Secrety jen jako názvy (Cloudflare secrets, GitHub Environments `production` / `preview`), nikdy v repu.
- AI provider(s): Jen v `quotes-worker/`: OpenCode Zen (`zen:` – GPT-5 nano, Claude Haiku/Sonnet/Opus), záloha Workers AI (`cf:`); modely se nastavují ve `quotes-worker/wrangler.toml`. Veřejný web AI nevolá.
- Checks: rychlá `npm run lint` + `npx playwright test tests/audit.spec.ts` (po `npm run build`) / plná `npm run build && npm test` (Playwright, 3 zařízení; stejné jako CI `playwright.yml`); u změn workeru `npm run build:worker`.
- Must change together: ceny, SEO metadata, JSON-LD, marketingová tvrzení, přesměrování a `public/llms.txt` (z něj se generuje `src/lib/llms.ts` příkazem `npm run sync:llms`) – před úpravou načíst skill `site-invariants` (`.claude/skills/site-invariants/SKILL.md`), hlídá je `tests/audit.spec.ts`. Změny právních textů, cookies a GA musí odpovídat consent logice v `src/app/layout.tsx`. Frázi „s doživotní zárukou“ nikdy nepoužít.
- Auto-merge: off

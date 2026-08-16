# Plán článků (rádce)

Témata pro sekci **Články** (`/clanky`). Vybraná podle reálné poptávky z Google
Search Console (dotazy se zobrazeními, ale bez cíleného obsahu) a podle služeb.
🔥 = nejsilnější SEO poptávka. Slug = navrhovaná URL (`/clanky/<slug>`).

Jak přidat článek: nová stránka `src/app/clanky/<slug>/page.tsx` (přes
`ArticleLayout`), záznam do `src/data/articles.json` (včetně pole `date` a `fbPost`).
Sitemapa i výpisy se generují z `src/lib/articles.ts` automaticky.

## Publikace podle data (varianta 2)

Všechny články jsou v `master`. Řídí je pole `date` v `src/data/articles.json`:

- Článek se **zveřejní sám** v den `date` — do té doby se neukazuje na homepage,
  v archivu `/clanky` ani v sitemapě (`publishedArticles` v `src/lib/articles.ts`).
- **Přímý odkaz `/clanky/<slug>` funguje i před zveřejněním** jako náhled, ale je
  `noindex` (nezaindexuje se). Přehled všech článků + FB post ke zkopírování je v
  admin sekci **`/sprava/clanky`**.
- Aby se článek objevil přesně v den `date` (statický build), přegenerovává se web
  **denně** naplánovaným rebuildem (GitHub Actions cron → Cloudflare deploy hook,
  `.github/workflows/scheduled-rebuild.yml`).

Termín nasazení = jen změna `date` v `articles.json` (žádné mergování větví).

## Hotovo (zveřejněno)
- ✅ Skvělé využití sklepních prostor — `skvele-vyuziti-sklepnich-prostor` — 16. 8. 2026
- ✅ Kolik stojí podřezání zdiva — `kolik-stoji-podrezani-zdiva` — 16. 8. 2026

## Naplánováno (v master, zveřejní se v daný den)

Napsané, čekají na svůj `date` v `articles.json`. Řazeno podle důležitosti
(🔥 = nejsilnější SEO poptávka), vždy jeden článek týdně (neděle).

- 🗓️ **23. 8. 2026** — Podřezání zdiva, nebo chemická injektáž? — `podrezani-nebo-injektaz`
- 🗓️ **30. 8. 2026** — Podřezání kamenného zdiva — `podrezani-kamenneho-zdiva`
- 🗓️ **6. 9. 2026** — Podřezání betonu a základů — `podrezani-betonu`
- 🗓️ **13. 9. 2026** — 🔥 Jak poznat vzlínající vlhkost — `jak-poznat-vzlinajici-vlhkost`
- 🗓️ **20. 9. 2026** — 🔥 Bílé výkvěty (salpetr) na zdivu — `bile-vykvety-salpetr`
- 🗓️ **27. 9. 2026** — 🔥 Plíseň na zdech: příčiny a trvalé řešení — `plisen-na-zdech`
- 🗓️ **4. 10. 2026** — 🔥 Sanační omítky: proč běžná omítka nestačí — `sanacni-omitky`
- 🗓️ **11. 10. 2026** — 5 nejčastějších příčin vlhkého zdiva — `priciny-vlhkeho-zdiva`
- 🗓️ **18. 10. 2026** — Jak probíhá podřezání domu krok za krokem — `jak-probiha-podrezani-domu`
- 🗓️ **25. 10. 2026** — Diamantové lano, nebo řetězová pila? — `lano-vs-retezova-pila`
- 🗓️ **1. 11. 2026** — Cena sanace zdiva: z čeho se skládá — `cena-sanace-vlhkeho-zdiva`
- 🗓️ **8. 11. 2026** — Vyplatí se sanace vlhkého zdiva? — `vyplati-se-sanace`
- 🗓️ **15. 11. 2026** — Jak vysušit vlhký sklep a udržet ho suchý — `jak-vysusit-vlhky-sklep`
- 🗓️ **22. 11. 2026** — Vinný sklep: jaké podmínky potřebuje — `vinny-sklep-podminky`
- 🗓️ **29. 11. 2026** — Jak dlouho zdivo vysychá po podřezání — `vysychani-zdiva`
- 🗓️ **6. 12. 2026** — Kupujete starší dům? Pozor na skrytou vlhkost — `skryta-vlhkost-pred-koupi`
- 🗓️ **13. 12. 2026** — Vlhkost v domě v zimě: kondenzace a plíseň — `vlhkost-v-dome-v-zime`
- 🗓️ **20. 12. 2026** — Betonáž základů a desek: na co si dát pozor — `betonaz-zakladu`
- 🗓️ **27. 12. 2026** — Pokládka obkladů a dlažby: příprava podkladu — `pokladka-obkladu`
- 🗓️ **3. 1. 2027** — Ztracené bednění: kdy a proč ho použít — `ztracene-bedneni`

## Backlog

Momentálně prázdný — všechna původní témata z backlogu jsou napsaná a naplánovaná
výše. Další nápady přidávej sem.

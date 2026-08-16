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
- 🗓️ **23. 8. 2026** — Podřezání zdiva, nebo chemická injektáž? — `podrezani-nebo-injektaz`
- 🗓️ **30. 8. 2026** — Podřezání kamenného zdiva — `podrezani-kamenneho-zdiva`
- 🗓️ **6. 9. 2026** — Podřezání betonu a základů — `podrezani-betonu`

## Backlog

### Vlhkost — příčiny a diagnostika (top-of-funnel, největší objem)
- 🔥 Jak poznat vzlínající vlhkost (a odlišit od kondenzace/zatékání) — `jak-poznat-vzlinajici-vlhkost`
- 🔥 Bílé výkvěty (salpetr) na zdivu — co to je a jak se jich zbavit — `bile-vykvety-salpetr`
- 🔥 Plíseň na zdech — proč vzniká a jak ji trvale odstranit — `plisen-na-zdech`
- 5 nejčastějších příčin vlhkého zdiva — `priciny-vlhkeho-zdiva`

### Metody sanace (podpoří stránky služeb)
- Jak probíhá podřezání domu krok za krokem — `jak-probiha-podrezani-domu`
- Diamantové lano vs. řetězová pila — rozdíly a kdy co — `lano-vs-retezova-pila`

### Cena a rozhodování
- Cena sanace: z čeho se skládá a co ji ovlivňuje — `cena-sanace-vlhkeho-zdiva`
- Vyplatí se sanace? Návratnost a rizika odkládání — `vyplati-se-sanace`

### Sklep a konkrétní prostory
- Jak vysušit vlhký sklep a udržet ho suchý — `jak-vysusit-vlhky-sklep`
- Vinný sklep: jaké podmínky potřebuje — `vinny-sklep-podminky`

### Po sanaci / navazující
- 🔥 Sanační omítky: proč běžná omítka nestačí — `sanacni-omitky`
- Jak dlouho zdivo vysychá po podřezání — `vysychani-zdiva`

### Zednické a obkladačské (podpora nové služby)
- Betonáž základů a desek: na co si dát pozor — `betonaz-zakladu`
- Pokládka obkladů a dlažby: příprava podkladu — `pokladka-obkladu`
- Ztracené bednění: kdy a proč — `ztracene-bedneni`

### Sezónní / praktické
- Vlhkost v domě v zimě (kondenzace, plíseň, prevence) — `vlhkost-v-dome-v-zime`
- Kupujete starší dům? Jak poznat skrytou vlhkost — `skryta-vlhkost-pred-koupi`

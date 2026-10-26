# Logo manuál IZODIAMANT

Samostatná statická stránka s pravidly pro používání loga IZODIAMANT a soubory ke stažení.
Žije v adresáři `logo-manual/` hlavního repozitáře, ale s webem izodiamant.cz (Next.js) nesouvisí – nemá build ani závislosti.
Samostatný Cloudflare Worker (statické soubory) `izodiamant-logo-manual` na **https://logo-manual.izodiamant.cz**.

## Obsah

| Cesta | Co to je |
|---|---|
| `index.html` | Celý manuál – jedna stránka |
| `logo/svg/` | 12 souborů: 4 tvary (logo, horizontální logo, nápis, ikona) × 3 barvy (barevné, černé, bílé) |
| `logo/png/` | Tytéž soubory jako PNG, průhledné pozadí, 2000–2400 px |
| `download/izodiamant-loga.zip` | Všechna loga v jednom balíčku |
| `fonts/` | Inter (variabilní WOFF2, latin + latin-ext) a licence |
| `img/` | Fotky pro ukázky podkladů (z realizací) |
| `wrangler.jsonc`, `.assetsignore` | Konfigurace workeru a seznam souborů, které se nepublikují |
| `_headers` | Hlavičky: noindex a stahování ZIPu |

## Původ loga

Dodané podklady byly jen PNG. SVG vznikla vektorizací (potrace) z průhledné alfa vrstvy černých PNG a pak se přebarvila.
Pokud se najde vektorový originál, nahraďte soubory v `logo/svg/` (zachovejte názvy) a přegenerujte PNG a ZIP.

## Nasazení

Automaticky přes `.github/workflows/deploy-logo-manual.yml` při každé změně `logo-manual/**` na `master` (potřebuje repo secrets `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`, stejně jako ostatní workery).
Doména `logo-manual.izodiamant.cz` se připojí sama při prvním nasazení (`routes` s `custom_domain` ve `wrangler.jsonc`); token tedy musí smět upravovat Workers Routes / DNS zóny izodiamant.cz.
Ruční nasazení: `cd logo-manual && npx wrangler deploy`.
Preview verze se nevytváří – větve se nenasazují.

## Úpravy

- Text a pravidla: `index.html`.
- Přegenerování ZIPu po změně loga:
  ```sh
  cd logo-manual/logo && rm ../download/izodiamant-loga.zip && zip -r ../download/izodiamant-loga.zip svg png
  ```
- Lokální náhled: `cd logo-manual && python3 -m http.server 8765`.

## Indexování

Manuál se záměrně neindexuje (`<meta name="robots">` a `X-Robots-Tag` v `_headers`).

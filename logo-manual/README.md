# Logo manuál IZODIAMANT

Samostatná statická stránka s pravidly pro používání loga IZODIAMANT a soubory ke stažení.
Žije v adresáři `logo-manual/` hlavního repozitáře, ale s webem izodiamant.cz (Next.js) nesouvisí – nemá build ani závislosti.
Určená adresa: **https://logo-manual.izodiamant.cz** (Cloudflare Pages).

## Obsah

| Cesta | Co to je |
|---|---|
| `index.html` | Celý manuál – jedna stránka |
| `logo/svg/` | 12 souborů: 4 tvary (logo, horizontální logo, nápis, ikona) × 3 barvy (barevné, černé, bílé) |
| `logo/png/` | Tytéž soubory jako PNG, průhledné pozadí, 2000–2400 px |
| `download/izodiamant-loga.zip` | Všechna loga v jednom balíčku |
| `fonts/` | Inter (variabilní WOFF2, latin + latin-ext) a licence |
| `img/` | Fotky pro ukázky podkladů (z realizací) |
| `_headers` | Hlavičky: noindex a stahování ZIPu |

## Původ loga

Dodané podklady byly jen PNG. SVG vznikla vektorizací (potrace) z průhledné alfa vrstvy černých PNG a pak se přebarvila.
Pokud se najde vektorový originál, nahraďte soubory v `logo/svg/` (zachovejte názvy) a přegenerujte PNG a ZIP.

## Nasazení na Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → toto repo.
2. *Build command* prázdné, *Build output directory* `logo-manual`, *Root directory* `/`.
3. Po prvním nasazení: **Custom domains** → `logo-manual.izodiamant.cz`.

Poznámka: hlavní web se teď staví jako Cloudflare Worker, takže tento projekt musí být samostatný Pages projekt, nikoli součást workflow `deploy-web.yml`.

## Úpravy

- Text a pravidla: `index.html`.
- Přegenerování ZIPu po změně loga:
  ```sh
  cd logo-manual/logo && rm ../download/izodiamant-loga.zip && zip -r ../download/izodiamant-loga.zip svg png
  ```
- Lokální náhled: `cd logo-manual && python3 -m http.server 8765`.

## Indexování

Manuál se záměrně neindexuje (`<meta name="robots">` a `X-Robots-Tag` v `_headers`).

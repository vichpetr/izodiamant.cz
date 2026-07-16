# Deployment Guide: Cloudflare Pages & Worker

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze ze **Seznam Firmy.cz** a **Google Maps**.

## 1. Cloudflare Pages (Frontend)
...

## 2. Cloudflare Worker (Recenze API – Seznam + Google)

Tento Worker:
- Parsuje recenze z Firmy.cz (HTML widget).
- Načítá recenze z Google Places API (Place Details).
- Vrací sjednocenou strukturu s polem `source` (`firmy` nebo `google`) tak, aby je web mohl zobrazovat v jednotném designu a s rozlišením zdroje.

### 2.1 Co potřebujete

- **Firmy.cz profile URL** – odkaz na firemní profil (např. `https://www.firmy.cz/detail/13505805-izodiamant-...`).
- **Google Place ID** – identifikátor firmy v Google Mapách (`ChIJ...`). Získání níže.
- **Google API Key** s povolenou `Places API` – získání níže.

> **Předpoklad pro Google:** firemní profil (Google Business Profile) musí být **založený a ověřený** – dokud není profil veřejný, Place ID neexistuje a Places API nic nevrátí. Kompletní průvodce profilem je v [`docs/google-business-profile.md`](docs/google-business-profile.md).

#### 2.1.1 Jak získat `GOOGLE_PLACE_ID`

Place ID je stálý identifikátor firmy v Google Mapách (mění se jen výjimečně).

1. Otevřete **Place ID Finder**: <https://developers.google.com/maps/documentation/places/web-service/place-id>.
2. Do vyhledávacího pole na mapě zadejte `IZODIAMANT Nové Hrady` a vyberte firmu.
3. Pod špendlíkem se zobrazí `Place ID` ve tvaru `ChIJ...` – zkopírujte ho.
4. Vložte do `worker/wrangler.toml` → `[vars]` → `GOOGLE_PLACE_ID = "ChIJ..."` a commitněte (Place ID není tajné).

Alternativa (pokud znáte jen odkaz z profilu): v URL profilu bývá CID (`...!1s0x...:0x<hex>` nebo `cid=<číslo>`). CID ≠ Place ID – pro worker potřebujete `ChIJ...` z finderu výše. (CID se používá jen pro `NEXT_PUBLIC_GOOGLE_MAPS_URL` / `sameAs`, což už web má.)

#### 2.1.2 Jak získat `GOOGLE_API_KEY`

Klíč s přístupem k Places API. Volání jsou zpoplatněná, proto klíč **omezte**.

1. Otevřete [Google Cloud Console](https://console.cloud.google.com/) a přihlaste se firemním Google účtem.
2. Nahoře vytvořte (nebo vyberte) projekt, např. `izodiamant-prod`.
3. **APIs & Services → Library** → vyhledejte **Places API** a dejte **Enable**. (Pokud vidíte „Places API (New)" i starou „Places API", povolte tu, kterou worker volá – aktuální kód používá endpoint `maps/api/place/details/json`, tj. **Places API**.)
4. **APIs & Services → Credentials → Create credentials → API key**. Klíč (`AIza...`) se zobrazí – zatím ho neuzavírejte.
5. Klikněte na **Edit API key** a nastavte omezení:
   - **API restrictions** → *Restrict key* → zaškrtněte pouze **Places API**.
   - **Application restrictions** → *None* (klíč běží jen na serveru ve workeru, ne v prohlížeči, proto referrer/IP omezení není nutné; volitelně lze omezit na IP Cloudflare).
6. **Uložte** a klíč zkopírujte.
7. **Billing:** Places API vyžaduje aktivní fakturaci projektu. Nastavte si v **Billing → Budgets & alerts** upozornění (např. na $5), ať máte náklady pod kontrolou. Při 1h cache workeru vychází provoz na jednotky centů měsíčně (~$17 / 1000 volání).
8. Klíč vložte jako **secret** (ne do repozitáře):
   ```bash
   cd worker && npx wrangler secret put GOOGLE_API_KEY
   # vložte AIza... hodnotu; secret přežije další deploye
   ```

Po nastavení `GOOGLE_PLACE_ID` (`wrangler.toml`) a secretu `GOOGLE_API_KEY` se při příštím nasazení workeru (změna `worker/**` → CI, nebo `npx wrangler deploy`) začnou vracet i Google recenze.

### 2.2 Zdroj Workeru a automatické nasazení

Zdroj Workeru je jediný soubor **`worker/src/index.js`** (konfigurace **`worker/wrangler.toml`**).
Nasazuje se **automaticky** přes GitHub Actions (`.github/workflows/deploy-worker.yml`), jakmile se
na větvi `master` změní cokoli pod `worker/**`. Ruční nasazení přes dashboard už není potřeba.

Worker odpovídá s `Cache-Control: public, max-age=3600` (1 h). Google Places API stojí ~$17 / 1000
Place Details requestů; při 1h cache to vychází na zlomek dolaru měsíčně.

Lokální práce (volitelné):

```bash
cd worker
npx wrangler dev              # lokální běh
npx wrangler deploy --dry-run # jen ověření konfigurace a bundlu (bez přihlášení)
npx wrangler deploy           # ruční nasazení (jinak řeší CI)
```

### 2.3 Konfigurace (vars & secret)

- **`FIRMY_PROFILE_URL`** a **`GOOGLE_PLACE_ID`** jsou v `worker/wrangler.toml` v sekci `[vars]`
  (verzované, aplikují se při každém nasazení). Place ID (`ChIJ...`) doplňte do `wrangler.toml`;
  prázdné = Google se přeskočí a Worker vrací jen recenze z Firmy.cz.
- **`GOOGLE_API_KEY`** je **secret** – NENÍ v repozitáři. Nastavte ho jednorázově:

  ```bash
  cd worker && npx wrangler secret put GOOGLE_API_KEY
  ```

  Secret v Cloudflare přežije další `wrangler deploy` (nepřepisuje se).

### 2.4 GitHub secrets pro pipeline

Aby CI mohlo nasazovat, přidejte v GitHubu (**Settings → Secrets and variables → Actions →
New repository secret**):

| Secret | Kde vzít |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → šablona *Edit Cloudflare Workers* (nebo token s právem *Workers Scripts: Edit*) |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → Workers & Pages → vpravo *Account ID* |

Po nastavení stačí změnit `worker/**` a mergnout do `master` – Worker se nasadí sám. Workflow lze
spustit i ručně: **Actions → Deploy Reviews Worker → Run workflow**.

### 2.5 Návratová struktura

```json
{
  "rating": 4.9,
  "count": 123,
  "reviews": [
    {
      "id": "google-2025-04-12-jan-novak",
      "source": "google",
      "author": "Jan Novák",
      "text": "Profesionální přístup, vše OK.",
      "date": "2025-04-12",
      "rating": 5,
      "sourceUrl": "https://www.google.com/maps/place/?q=place_id:...",
      "authorUrl": "https://www.google.com/maps/contrib/...",
      "profilePhoto": "https://lh3.googleusercontent.com/..."
    },
    {
      "id": "firmy-2025-03-22-marie-svobodova",
      "source": "firmy",
      "author": "Marie Svobodová",
      "text": "Doporučuji.",
      "date": "2025-03-22",
      "rating": 5,
      "sourceUrl": "https://www.firmy.cz/detail/13505805-..."
    }
  ],
  "sources": {
    "firmy": { "rating": 4.9, "count": 80, "error": null },
    "google": { "rating": 5.0, "count": 43, "sourceUrl": "...", "error": null }
  },
  "lastUpdate": "2026-05-15T08:00:00.000Z"
}
```

### 2.6 Frontend integrace

Frontend (`HomeReviews.tsx`) konzumuje `reviews[]`, řadí podle `date` a renderuje badge podle `source`. Fallback `src/data/reviews.json` musí obsahovat `source` na každé položce (`"firmy"` nebo `"google"`), aby UI fungovalo i bez Workeru.

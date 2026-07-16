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
- **Google Place ID** – identifikátor firmy v Google Mapách. Získání viz `docs/google-business-profile.md`.
- **Google API Key** s povolenou `Places API` (resp. „Place Details") – viz [Google Cloud Console](https://console.cloud.google.com/). Omezit API key na `Places API` a (volitelně) HTTP referrer / IP, aby nešel zneužít.

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

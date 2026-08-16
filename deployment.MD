# Deployment Guide: Cloudflare Pages & Worker

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze ze **Seznam Firmy.cz** a **Google Maps**.

## 1. Cloudflare Pages (Frontend)

Frontend se staví přes Cloudflare Pages (Git integrace v dashboardu, build `@cloudflare/next-on-pages`). Veřejný web žádné secrety navíc nepotřebuje.

### 1.1 Skrytá admin sekce `/sprava` (evidence zákazníků + poděkování s prosbou o hodnocení)

Sekce je nelinkovaná, `noindex` a chráněná přihlášením přes Google. Bez níže uvedené konfigurace se veřejný web chová normálně a `/sprava` slušně ukáže přihlášení (nespadne). Ke zprovoznění:

**a) Google OAuth 2.0 klient** (Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID → *Web application*):
- Authorized redirect URIs: `https://izodiamant.cz/api/auth/callback/google` (+ `http://localhost:3000/api/auth/callback/google` pro dev).
- **Testujete-li admin na preview deploji** (Cloudflare Pages branch alias), přidejte i redirect URI té větve: `https://<branch>.izodiamant-cz.pages.dev/api/auth/callback/google` (název větve: tečky/lomítka → pomlčky, např. `feat/clanky-date-publish` → `feat-clanky-date-publish`). Google **nepodporuje wildcardy**, takže každou testovanou větev je nutné přidat zvlášť. Přihlašujte se přes **branch alias**, ne přes per-commit URL (`<hash>.…pages.dev`) – ta se mění každým buildem.
- Zkopírujte **Client ID** a **Client secret**.

**b) Cloudflare D1 databáze:**
```bash
npx wrangler d1 create izodiamant-db           # vytvoří DB, vypíše database_id
npm run db:schema:remote                        # aplikuje db/schema.sql (viz package.json)
```
V **Pages projektu → Settings → Functions → D1 database bindings** přidejte binding **Variable name `DB`** → vytvořená databáze. (Kód ji čte přes `getRequestContext().env.DB`.)

**c) Environment variables / secrets** (Pages → Settings → Environment variables, Production):
| Proměnná | Hodnota |
|---|---|
| `AUTH_SECRET` | náhodný řetězec (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Client ID z kroku a) |
| `AUTH_GOOGLE_SECRET` | Client secret z kroku a) |
| `AUTH_URL` | `https://izodiamant.cz` |
| `ADMIN_EMAILS` | povolené Google účty, čárkami: `vichpetr@gmail.com,...` |

**d) Odesílání zákazníkům:** poděkování jde přes Resend (stejně jako potvrzení z formuláře). `FROM_EMAIL` musí být z **ověřené domény** v Resendu (web už zákazníkům potvrzení posílá, takže je pravděpodobně hotové).

> **`AUTH_URL` patří jen do Production, ne do Preview.** Cloudflare Pages sdílí env
> proměnné napříč **všemi** preview deploji (jedno „Preview" prostředí). Pevná `AUTH_URL`
> tam připíchne přihlášení na jedinou větev – po loginu vás to pak vrátí na cizí (starší)
> preview bez ohledu na to, kde jste začali. Proto: nastavte `AUTH_URL` **výhradně ve
> scope Production** (`https://izodiamant.cz`) a v **Preview scope ji nechte prázdnou**.
> Kód má `trustHost: true` (`src/auth.ts`), takže si na previewu host odvodí z requestu a
> každá větev funguje na své vlastní doméně. Změna env proměnných se projeví až **novým
> buildem** – po úpravě větev znovu nasaďte (Deployments → Retry deployment).

Po nastavení: `https://izodiamant.cz/sprava` → přihlášení Googlem → jen e-mail z `ADMIN_EMAILS` se dostane dovnitř. Přidání dalšího správce = doplnit `ADMIN_EMAILS` (bez zásahu do kódu). Lokální dev: `.env.local` s `AUTH_*`/`ADMIN_EMAILS` + `npm run db:schema:local` a `npx wrangler pages dev`.

### 1.2 Automatické plánování FB postů (články + reference)

Workflow `.github/workflows/fb-schedule.yml` běží **denně (06:20 UTC)** a skript
`scripts/fb-schedule.mjs` sám rozhodne podle dne v týdnu (Europe/Prague):

- **pondělí** → naplánuje FB post k další **referenci** (chronologicky, od nejstarší),
- **čtvrtek** → naplánuje FB post k dalšímu už zveřejněnému **článku** (v pořadí zveřejnění),

oba na **dnešek v 11:30**. Text bere z pole `fbPost` (v `references.json`, resp.
`articles.json`), odkaz z URL detailu (`/reference/<id>`, `/clanky/<slug>`).

„Další" = první v kanonickém pořadí, jehož odkaz ještě není mezi FB posty stránky
(naplánovanými ani zveřejněnými). Fronta se tak drží **stateless přes samotný FB** –
skript čte `scheduled_posts` i `feed`, takže nevytvoří duplicitu ani k ručně
naplánovaným postům. Přesný čas 11:30 pohlídá Facebook; post je vidět (a jde
upravit/zrušit) v Meta Business Suite. Přehled textů je i v adminu: `/sprava/clanky`
a `/sprava/reference`.

Job běží po denním rebuildu (`scheduled-rebuild.yml` ve 04:10 UTC), takže je obsah na
webu aktuální a Facebook si stáhne správný náhled z OG tagů. Ruční test bez odeslání:
`TZ=Europe/Prague FB_DRY_RUN=1 FB_FORCE_KIND=reference node scripts/fb-schedule.mjs`
(nebo `FB_FORCE_KIND=article`).

**Co zřídit (jednorázově):**

1. **Facebook stránka** (Page), kde jsi admin. Postovat přes API na osobní profil nejde.
2. **Meta app** na [developers.facebook.com](https://developers.facebook.com) (typ *Business*).
   Může zůstat v **Development módu** – pro postování na vlastní stránku, kde jsi admin,
   **není potřeba App Review**.
3. **Access token** s právy `pages_manage_posts` a `pages_read_engagement`:
   - Nejodolnější je **System User** token: business.facebook.com → *Business settings*
     → *Users → System users* → přidat, přiřadit stránku a vygenerovat token s těmi právy
     (jde nastavit jako nevypršitelný). Alternativně jde Page token vytáhnout přes Graph
     API Explorer (`/me/accounts`), ten ale kratší dobu vydrží.
4. **Page ID** zjistíš v nastavení stránky (O stránce) nebo přes `/me/accounts`.
5. V GitHubu (*Settings → Secrets and variables → Actions*) přidej repo secrets:
   - `FB_PAGE_ID`
   - `FB_PAGE_ACCESS_TOKEN`

Bez těchto secrets job jen tiše doběhne (nic nenaplánuje), workflow nepadá. Ruční test:
*Actions → FB auto-poster → Run workflow*. Lokální suchý běh bez tokenu:
`TZ=Europe/Prague FB_DRY_RUN=1 node scripts/fb-schedule.mjs` (jen vypíše, co by naplánoval).

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

Place ID je stálý identifikátor firmy v Google Mapách (`ChIJ...`; mění se jen výjimečně).

> **Pozor – Place ID NENÍ v URL profilu.** Odkaz z Google Maps obsahuje jen **CID** a **feature ID**, ne Place ID. Např. v `…!1s0x470d95c41287715b:0xa247d518cbaca940…!16s%2Fg%2F11zgw3dcgm…` je `0x…a247d518cbaca940` = CID a `/g/11zgw3dcgm` = feature ID. **Ani jedno není `ChIJ...`** – Place ID se musí dohledat jedním ze způsobů níže. (CID se používá jen pro `NEXT_PUBLIC_GOOGLE_MAPS_URL` / `sameAs`, což web už má.)

**Způsob A – Place ID Finder (bez API klíče):**

1. Otevřete <https://developers.google.com/maps/documentation/places/web-service/place-id>.
2. **Odscrolujte k interaktivní mapě** níže na stránce – přímo v mapě je vyhledávací pole „Enter a location".
3. Zadejte `IZODIAMANT Nové Hrady` a vyberte firmu.
4. Nad špendlíkem vyskočí bublina s **`Place ID: ChIJ...`** – zkopírujte ho.

**Způsob B – přes API klíč (jedna adresa v prohlížeči):** až budete mít `GOOGLE_API_KEY` (viz 2.1.2), otevřete:

```
https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=IZODIAMANT%20Nov%C3%A9%20Hrady&inputtype=textquery&fields=place_id&key=VAS_KLIC
```

Odpověď obsahuje `"place_id": "ChIJ..."`.

Získané `ChIJ...` vložte do `worker/wrangler.toml` → `[vars]` → `GOOGLE_PLACE_ID = "ChIJ..."` a commitněte (Place ID není tajné).

> **Firmu ve finderu nevidíte?** Nejčastější příčina je **neověřený profil** – Place ID Finder i Places API pracují jen s veřejnými (ověřenými) profily. Počkejte, až Google profil ověří a zveřejní; teprve pak se firma ve finderu objeví. Spěch nedává smysl – dokud profil není živý, nemá ani žádné Google recenze k načtení.

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

Frontend (`HomeReviews.tsx`) konzumuje `reviews[]`, řadí podle `date` a renderuje badge podle `source`. **Statický fallback `reviews.json` byl odstraněn** – bez dostupného Workeru (nebo když vrátí prázdno) se sekce hodnocení i recenze u referencí prostě nevykreslí. Raději nic než neaktuální/nereálná záložní data.

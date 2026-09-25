# Deployment Guide: Cloudflare Workers

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze ze **Seznam Firmy.cz** a **Google Maps**.

## 1. Frontend (Cloudflare Worker `izodiamant`)

Web je Next.js nasazený jako Cloudflare Worker přes **OpenNext** (`@opennextjs/cloudflare`).
Do září 2026 běžel na Cloudflare Pages (`@cloudflare/next-on-pages`).

| | produkce | preview (ostatní větve) |
|---|---|---|
| worker | `izodiamant` | `izodiamant-preview` |
| adresa | `izodiamant.cz` (+ `www` → 301), `izodiamant.<účet>.workers.dev` | `<větev>-izodiamant-preview.<účet>.workers.dev` |
| D1 `DB` | `izodiamant-db` | `izodiamant-preview-db` |
| `QUOTES` | `izodiamant-quotes` | `izodiamant-quotes-preview` |
| GitHub Environment | `production` | `preview` |

- **Konfigurace:** `wrangler.jsonc` (bindingy, domény jako Custom Domains), `open-next.config.ts`
  (předrenderované stránky se čtou ze statických assetů – bez KV/R2 cache).
- **Nasazení:** `.github/workflows/deploy-web.yml` – push na master → produkce, push na jinou
  větev → nová preview verze s aliasem větve, cron 04:10 UTC → denní rebuild (články naplánované
  v `articles.json` se zveřejní v den `date`). Nasazuje se přes `opennextjs-cloudflare deploy` /
  `upload`, ne holým `wrangler deploy` – jen tak se naplní cache předrenderovaných stránek.
- **Git integraci v Cloudflare (Workers Builds) nezapínat** – nasazuje GitHub Actions; druhá
  pipeline by build přepisovala (a bez `NEXT_PUBLIC_*` a OpenNext buildu).

Veřejný web žádné secrety navíc nepotřebuje.

### 1.1 Proměnné, secrety a přihlášení

**a) `NEXT_PUBLIC_*` – GitHub Variables** (zapékají se do JS při buildu, do nastavení workeru
se nedostanou). Workflow běží v GitHub Environment `production` / `preview`; hodnota se hledá
nejdřív v prostředí, pak v repo-level Variables (Settings → Secrets and variables → Actions):

| Proměnná | Kde | Pozn. |
|---|---|---|
| `NEXT_PUBLIC_FIRMY_PROFILE_URL` | repo | povinná |
| `NEXT_PUBLIC_REVIEWS_API_URL` | production / preview | preview: placeholder `…vas-ucet…` = recenze se nevykreslí |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | production | preview bez GA, nezkresluje statistiky |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | production / preview | widget povoluje jen své hostnamy → preview testovací `1x00000000000000000000AA` |
| `NEXT_PUBLIC_CF_IMAGES` | production (`true`) | zmenšování obrázků přes `/cdn-cgi/image` – funguje jen na izodiamant.cz |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL`, `…_FIRMY_REVIEW_URL`, `…_GOOGLE_MAPS_URL`, `…_GOOGLE_SITE_VERIFICATION`, `…_BING_SITE_VERIFICATION` | volitelné | bez nich výchozí hodnoty z kódu |

Změna proměnné se projeví až novým buildem (Actions → Deploy Web (Workers) → Run workflow).

**b) Secrety workeru** (serverové, přežijí deploy). Z kořene repa:
```bash
npx wrangler secret put <NÁZEV> --env=""                  # produkce (izodiamant)
npx wrangler versions secret put <NÁZEV> --env preview    # preview (izodiamant-preview)
```
Na preview jde jen `versions secret put`: větve nahrávají verze (`versions upload`), žádná není
„nasazená“, a obyčejný `secret put` to odmítne. Secret se přenáší do dalších verzí.

| Secret | |
|---|---|
| `RESEND_API_KEY` | povinný – kontaktní formulář, kalkulačka, poděkování z `/sprava` |
| `AUTH_SECRET` | povinný pro `/sprava` – `openssl rand -base64 32 \| npx wrangler secret put AUTH_SECRET --env=""` (nový = jen nové přihlášení) |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | OAuth klient z kroku c) |
| `ADMIN_EMAILS` | povolené Google účty, čárkami |
| `FROM_EMAIL` | volitelný (výchozí `onboarding@resend.dev`), musí být z ověřené domény v Resendu |
| `CONTACT_EMAIL` | volitelný (výchozí `info@izodiamant.cz`) – kam chodí poptávky |
| `TURNSTILE_SECRET_KEY` | volitelný; bez něj se token nekontroluje (preview: `1x0000000000000000000000000000000AA`) |

`AUTH_URL` **nenastavujte** – `trustHost: true` (`src/auth.ts`) odvodí adresu z požadavku, takže
přihlášení funguje na izodiamant.cz, workers.dev i na aliasech větví.

**c) Google OAuth 2.0 klient** (Google Cloud Console → APIs & Services → Credentials → OAuth
client ID → *Web application*) – *Authorized redirect URIs*:
- `https://izodiamant.cz/api/auth/callback/google`
- `https://izodiamant.<účet>.workers.dev/api/auth/callback/google`
- `http://localhost:8787/api/auth/callback/google` (lokální `npm run preview:worker`)
- testujete-li admin na větvi: `https://<alias>-izodiamant-preview.<účet>.workers.dev/api/auth/callback/google`
  (alias = název větve malými písmeny, jiné znaky → `-`, max. 30 znaků). Google nepodporuje
  wildcardy – každou testovanou větev přidat zvlášť.

**d) D1:** databáze `izodiamant-db` / `izodiamant-preview-db` jsou ve `wrangler.jsonc`; schéma
aplikuje CI quotes-workeru (§3.1), ručně `npm run db:schema:remote` / `db:schema:preview:remote`.

`/sprava` je nelinkovaná (jen nenápadně z patičky), `noindex` a chráněná přihlášením Googlem –
dovnitř se dostane jen e-mail z `ADMIN_EMAILS`. Bez secretů se veřejný web chová normálně a
`/sprava` jen ukáže přihlášení.

**Lokálně:** `npm run preview:worker` (build + workerd s bindingy `env.preview`, lokální D1),
secrety do `.dev.vars` (`AUTH_SECRET=…` apod.), schéma `npm run db:schema:local`.
Pro čistý frontend stačí `npm run dev`.

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
upravit/zrušit) v Meta Business Suite. Přehled textů je i v adminu na `/sprava/clanky`
(záložky **Články** a **Reference**).

Job běží po denním rebuildu (`deploy-web.yml`, cron 04:10 UTC), takže je obsah na
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

## 3. Cenové nabídky (`/sprava/nabidky` + Worker `quotes-worker`)

Admin sekce pro přípravu cenových nabídek jako průvodce ve třech krocích
(`?id=…&krok=1|2|3`): **Podklady** (text e-mailu, přílohy a co z nich AI vyčetla) →
**Údaje a ceny** (formulář, ceny zadává člověk) → **Odeslání** (verze PDF, text e-mailu,
přílohy, koncept do schránky / odeslání). Poptávky čte ze schránky `info@izodiamant.cz`.

```
Web /sprava/nabidky ──service binding QUOTES──▶ quotes-worker ──▶ D1 (DB), R2 (BUCKET)
   (UI, D1 čtení/zápis formuláře)                   │  AI: OpenCode Zen (Claude), záloha Workers AI
                                                    │  Queue JOBS (hodnocení a čtení příloh, auto-PDF)
                                                    │  Browser Rendering (HTML → PDF, PDF → obrázky)
                                                    └─ IMAP/SMTP Seznam (cron každých 15 min)
```

- **Ceny počítá kód** (`src/lib/quotes/calc.ts`), AI navrhuje jen rozměry a texty – vše
  potvrzuje člověk. Předvyplněná cena za m² = střed ceníku z `calculator.json`; doprava se
  zadává ručně (odvozování cen přijde později).
- **Třídění pošty:** AI zprávu zařadí jako *poptávku* (→ nabídka, přílohy, archiv),
  *dotaz* (zůstane ve schránce netknutý, v adminu je vidět se shrnutím) nebo *ostatní*.
- **Přílohy:** levný model každou ohodnotí (půdorys / řez / pohled / logo / výkaz…,
  relevance vysoká–žádná). Silný model čte jen relevantní (vysoká, střední) – z výkresu
  délku obvodových zdí a tloušťku, z výkazu výměr (XLSX/XLS/CSV) řádky s naší prací.
  Uživatel může relevanci přehlasovat. U nabídek z e-mailu se rozměry propíšou do
  **prázdných** polí (s evidencí původu v `quotes.field_sources`, v UI štítek „AI · …“).
- **Automatické PDF:** když má nabídka z e-mailu všechny údaje (`missingInputs()` – včetně
  ceny dopravy), vygeneruje se PDF a stav je *Připraveno k odeslání*. Odesílá vždy člověk.
- **Výkaz výměr:** v xlsx se přepíšou jen buňky jednotkové ceny (sloupec „J. cena“ dohledá
  kód podle hlavičky), název zhotovitele a IČ; uložené výsledky vzorců se zahodí, takže
  Excel/LibreOffice po otevření vše přepočítají. DIČ a sazba DPH se nemění (upozornění
  v UI – firma není plátce DPH). Vyplněný výkaz jde k e-mailu jako návrh ke kontrole.
- **Verze:** formulář nabídky se ukládá automaticky; každé „Vygenerovat přílohy“ se změněnými údaji založí verzi – PDF a
  vyplněný výkaz (je-li na vstupu) vznikají vždy společně; „přiložit k e-mailu“ jen řídí odeslání
  (`quote_versions`, PDF `nabidky/<číslo>-v<n>.pdf`, výkaz `…-v<n>-vykaz.xlsx`). Beze změny
  nová verze nevznikne (otisk vstupů). K e-mailu jde `quotes.email_version`, jinak poslední.
- **Číslo nabídky:** `NAB-RRRRMMDD-PP-OBE` – `PP` pořadí nabídky v daný den, `OBE` první
  tři písmena obce (bez obce se přípona vynechá).
- **Dvě prostředí se samostatnými daty:** `izodiamant-quotes` (D1 `izodiamant-db`, R2
  `izodiamant-nabidky`) a `izodiamant-quotes-preview` (D1 `izodiamant-preview-db`, R2
  `izodiamant-nabidky-preview`). Vše je v `quotes-worker/wrangler.toml`.
- Worker **není na internetu** (`workers_dev = false`, bez rout) – volá ho jen worker webu přes
  service binding; autorizaci (Google + `ADMIN_EMAILS`) řeší web.
- Sdílený kód (model, výpočty, HTML šablona PDF) je v `src/lib/quotes/` a worker ho bundluje
  relativní cestou – proto tam nesmí být importy přes `@/`.

### 3.1 Jednorázové nastavení

1. **Workers Paid** ($5/měs.) – Browser Rendering, Queues a delší CPU quotes-workeru.
   (Worker webu má ~2,3 MiB gzip – limit free plánu je 3 MiB, Paid 10 MiB.)
2. **R2 buckety** `izodiamant-nabidky` a `izodiamant-nabidky-preview` (už vytvořené).
3. **Schéma D1** – nové tabulky jsou v `db/schema.sql` (idempotentní), nové sloupce do
   existujících tabulek v `db/migrations/*.sql` (ALTER TABLE). Obojí aplikuje CI při nasazení
   workeru (migrace po jednom příkazu, „duplicate column name“ = už proběhla). Ručně:
   `npm run db:schema:remote` / `npm run db:schema:preview:remote` a ALTERy přes
   `npx wrangler d1 execute <db> --remote --command "…"`.
4. **Service binding `QUOTES`** je ve `wrangler.jsonc` webu (produkce → `izodiamant-quotes`,
   `env.preview` → `izodiamant-quotes-preview`). Bez něj sekce funguje jen jako formulář a ukáže
   hlášku „Služba nabídek není připojená“.
5. **API token pro CI** (`CLOUDFLARE_API_TOKEN`, viz 2.4) musí mít navíc práva
   *D1: Edit*, *Workers R2 Storage: Edit*, *Workers AI: Read* a *Browser Rendering: Edit*.

### 3.2 Schránka (fáze 2 a 3)

Konfigurace je ve `quotes-worker/wrangler.toml` zvlášť pro produkci a `[env.preview]`:

| Proměnná | Význam |
| --- | --- |
| `MAILBOX_USER` | adresa schránky (produkce `info@izodiamant.cz`; **na preview zadejte testovací schránku**) |
| `MAILBOX_PASSWORD` | **secret** – heslo (při zapnutém dvoufázovém ověření heslo pro aplikace) |
| `INBOX_ENABLED` | `true` = cron každých 15 min čte schránku; ruční „Zkontrolovat schránku“ funguje vždy |
| `INBOX_ARCHIVE_FOLDER` | kam se přesunou zpracované poptávky (složka se sama založí); zpráva se předtím označí jako přečtená |
| `INBOX_LABEL` | štítek (IMAP keyword); nastaví se jen když ho server povolí (`PERMANENTFLAGS \*`) |
| `INBOX_LOOKBACK_DAYS`, `INBOX_MAX_PER_RUN` | kolik dní zpět a kolik zpráv na jeden běh |
| `DRAFTS_FOLDER`, `SENT_FOLDER` | prázdné = najde se podle IMAP special-use |
| `SEND_ENABLED` | `true` = tlačítko „Odeslat klientovi“ (SMTP); jinak jen koncepty do schránky |

```bash
cd quotes-worker
npx wrangler secret put MAILBOX_PASSWORD --env preview   # testovací schránka
npx wrangler secret put MAILBOX_PASSWORD                  # produkce info@
```

Doporučený postup: na preview nastavit testovací schránku → poslat do ní pár poptávek →
v adminu „Zkontrolovat schránku“ → ověřit nabídky, archivaci a koncepty → pak `INBOX_ENABLED`
a teprve nakonec `SEND_ENABLED` v produkci.

Zpracované e-maily se evidují v `inbox_messages` (klíč Message-ID) – nic se nezpracuje dvakrát.
Nepoptávky zůstávají ve schránce netknuté. Obsah e-mailu je pro AI nedůvěryhodný vstup: smí z něj
jen vyplnit pole nabídky, nikdy nic neodešle.

### 3.3 AI modely a klíč

Model se volí podle úlohy ve `quotes-worker/wrangler.toml` (obě prostředí), tvar
`<ovladač>:<model>`:

| Proměnná | Úloha | Výchozí |
| --- | --- | --- |
| `AI_TRIAGE_MODEL` | třídění pošty, údaje z textu poptávky | `zen:gpt-5-nano,zen:claude-haiku-4-5` |
| `AI_ATTACHMENT_MODEL` | hodnocení relevance příloh (vidí obrázky) | `zen:gpt-5-nano,zen:claude-haiku-4-5` |
| `AI_EXTRACT_MODEL` | čtení výkresů a výkazů výměr | `zen:claude-opus-5-5` |
| `AI_TEXT_MODEL` | text e-mailu klientovi | `zen:claude-sonnet-5` |
| `AI_FALLBACK_MODEL` | záloha při chybě / chybějícím klíči | `cf:@cf/google/gemma-4-26b-a4b-it` |

Víc modelů čárkou = zkouší se popořadě, nakonec záloha. V Zen jde `claude-*` přes `/messages`
(klíč v hlavičce `x-api-key` – dokumentace Zen uvádí Bearer, ale ten tam nefunguje), `gpt-*`
přes `/responses` (Bearer), ostatní přes `/chat/completions` (Bearer).

Ovladače: `zen:` = OpenCode Zen (hlavní brána, secret `OPENCODE_API_KEY`), `anthropic:` =
Claude API přímo (secret `ANTHROPIC_API_KEY`), `cf:` = Workers AI (bez klíče). Bez klíče
worker funguje dál na záloze (Gemma), jen hůř čte výkresy.

```bash
cd quotes-worker
npx wrangler secret put OPENCODE_API_KEY                  # produkce
npx wrangler secret put OPENCODE_API_KEY --env preview    # preview
```

Každé volání (úloha, model, tokeny, doba, chyba) se zapisuje do tabulky `ai_usage` –
podle ní jde ověřit skutečné náklady:
`SELECT model, COUNT(*), SUM(input_tokens), SUM(output_tokens) FROM ai_usage GROUP BY model`.

### 3.4 Lokální vývoj

```bash
cd quotes-worker && npm ci
npx wrangler d1 execute izodiamant-preview-db --local --env preview --persist-to ../.wrangler/state --file=../db/schema.sql
npx wrangler dev --env preview --persist-to ../.wrangler/state      # bez OPENCODE_API_KEY jede AI na záloze (Workers AI), PDF lokální Chromium
# v kořeni (web jako Worker, bindingy z wrangler.jsonc env.preview, secrety do .dev.vars):
#   npm run preview:worker
```

### 3.5 Náklady (orientačně, 40 nabídek + 300 e-mailů měsíčně)

- AI přes OpenCode Zen: třídění 300 e-mailů a hodnocení příloh (GPT-5 nano) pod 0,5 USD,
  čtení ~80 výkresů/výkazů (Opus, ~0,05 USD za soubor) ~4–5 USD, texty e-mailů (Sonnet)
  pod 0,5 USD → **řádově 5–10 USD měsíčně**. Skutečnost ukáže tabulka `ai_usage`.
- Workers AI (záloha): prakticky v rámci 10 000 neuronů denně zdarma.
- R2: PDF ~0,4 MB (každá verze zvlášť) → stovky nabídek ročně jsou hluboko ve free tieru (10 GB).
- Browser Rendering: ~5–10 s na PDF / náhled, v rámci 10 h/měs. zahrnutých v Paid plánu.
- Queues: jednotky tisíc zpráv měsíčně, v rámci Paid plánu.

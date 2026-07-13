# Google Business Profile (GBP) – průvodce pro IZODIAMANT

Tento dokument popisuje, jak založit a spravovat firemní profil firmy IZODIAMANT na Google (dříve „Google Moje firma" / „Google My Business"), jak napsat recenzi, jak pomoci zákazníkovi recenzi napsat a jak získat `Place ID` a `Maps URL` pro integraci s webem (`NEXT_PUBLIC_GOOGLE_MAPS_URL`, `GOOGLE_PLACE_ID` ve workeru).

---

## 1. Založení Google Business Profile

### 1.1 Předpoklady
- Google účet (ideálně firemní, např. `firma@izodiamant.cz`, ne soukromý). Pokud ho ještě nemáte, založte na <https://accounts.google.com/signup>.
- Reálná fyzická adresa nebo servisní oblast (IZODIAMANT obojí: sídlo Mokrá Lhota 26, Nové Hrady + servisní oblast po celé ČR).
- Telefonní číslo, na kterém přijmete ověřovací hovor / SMS (`+420 737 017 012`).
- Webová stránka: `https://izodiamant.cz`.

### 1.2 Postup
1. Otevřete <https://business.google.com/create> a přihlaste se firemním Google účtem.
2. **Název firmy**: zadejte přesně `IZODIAMANT` (bez popisu služeb – Google to nemá rád, zakázáno přidávat klíčová slova k názvu).
3. **Kategorie**: hlavní `Stavební firma` (`General Contractor`). Doplňkové:
   - „Sanace zdiva" / `Waterproofing service`
   - „Hydroizolace" / `Insulation contractor`
4. **Umístění**:
   - Pokud chcete zobrazovat adresu, zaškrtněte „Ano, mám provozovnu, kterou mohou zákazníci navštívit": Mokrá Lhota 26, 539 44 Nové Hrady, ČR.
   - Pokud chcete jen výjezdovou službu bez ukazování adresy: „Ne, obsluhuji zákazníky v jejich lokalitě" → vyplňte **servisní oblasti** (Pardubický kraj, Královéhradecký, Středočeský, Praha, případně další).
5. **Kontakt**: telefon `+420 737 017 012`, web `https://izodiamant.cz`.
6. **Ověření**: Google vyžaduje ověření přes pohlednici (poštou na adresu, do 2 týdnů), nebo někdy přes telefon/e-mail. **Profil je veřejně viditelný až po ověření.**
7. Po ověření dokončete profil:
   - **Logo** + **úvodní fotka** (banner).
   - **Fotografie realizací** (před/po). Min. 5–10 fotek, vysoké rozlišení, vlastní (ne stock).
   - **Popis firmy** (do 750 znaků): obsahuje „sanace vlhkého zdiva", „podřezávání diamantovým lanem / řetězovou pilou", „chemická injektáž", „Vracíme zdraví vaší stavbě.".
   - **Otevírací doba**: Po–Pá 08:00–17:00 (musí odpovídat tomu, co máme v `LocalBusiness` JSON-LD v `src/app/layout.tsx`).
   - **Atributy**: „Bezplatný odhad ceny", „Vlastník působí v této firmě" apod.
   - **Produkty / služby**: jednotlivé položky (Diamantové lano, Řetězová pila, Chemická injektáž, Statické zajištění, …) s krátkým popisem a orientační cenou.

### 1.3 Získání Place ID a Maps URL pro web

Po ověření a publikaci profilu:

- **Place ID** (pro `GOOGLE_PLACE_ID` ve workeru): <https://developers.google.com/maps/documentation/places/web-service/place-id> – stránka má vyhledávání, zadejte „IZODIAMANT Nové Hrady", zkopírujte `ChIJ...` ID.
- **Maps URL** (pro `NEXT_PUBLIC_GOOGLE_MAPS_URL` v Pages env): otevřete profil v Google Maps a v adresním řádku zkopírujte celou URL (`https://www.google.com/maps/place/IZODIAMANT/@49.85...,...`). Tato URL skončí v `sameAs` v JSON-LD a v `<a>` linkách na recenze.

### 1.4 Google API Key pro recenze (Worker)

1. <https://console.cloud.google.com/> → nový projekt `izodiamant-prod` (nebo už existující).
2. **APIs & Services → Library** → povolte **Places API** (resp. nově `Places API (New)`).
3. **APIs & Services → Credentials** → **Create credentials → API key**.
4. Omezení klíče (Restrictions):
   - **Application restrictions**: `IP addresses` → IP rozsah Cloudflare (nebo ponechte „None" a klíč nikde nepoužívejte v prohlížeči).
   - **API restrictions**: pouze `Places API`.
5. Klíč zkopírujte a vložte jako **Secret** `GOOGLE_API_KEY` ve Worker → Settings → Variables.

> **Cena**: Places „Place Details" = $17 / 1 000 volání. Worker cachuje na 1 h (`Cache-Control: max-age=3600`), takže reálně ~720 volání/měsíc = pod $0,02. Hlídejte si **Billing** a nastavte budget alert v Google Cloud.

---

## 2. Správa profilu (denní/měsíční rutina)

- **Nové fotografie** (cca 1× měsíčně po realizaci) – Google odměňuje aktivní profily.
- **Příspěvky** (Posts) – krátké aktuality, sezónní akce, nová reference. Max 1 500 znaků, lze přidat CTA „Více informací" odkazující na `/sluzby/...` nebo `/mesta/...`.
- **Otázky a odpovědi (Q&A)** – sledujte sekci „Otázky", odpovídejte do 24 h. Sami si můžete položit a zodpovědět nejčastější otázky (FAQ ze `src/data/faq.json`).
- **Recenze** – reagujte na **každou** recenzi (i 5★) krátkým, zdvořilým, personalizovaným komentářem. Negativní recenzi nikdy nemažte konfliktně – odpovězte věcně, nabídněte řešení mimo platformu (telefon).
- **Statistiky** (Insights) – jednou měsíčně se podívejte:
  - Kolik lidí profil zobrazilo přes hledání vs. Mapy.
  - Kolik kliklo na telefon / web / trasu.
  - Jaké dotazy lidé hledali (cenné pro SEO a klíčová slova v `mesta.json`).

### 2.1 Více správců
Settings → **Managers** → pozvat další účty (e-mail). Role:
- **Owner** – plná kontrola, převod vlastnictví.
- **Manager** – vše kromě smazání profilu a převodu vlastnictví.
Doporučení: vlastníkem je firemní `firma@izodiamant.cz`, manager je osobní účet majitele.

---

## 3. Jak napsat recenzi pro IZODIAMANT (postup pro autora)

1. Otevřete `https://g.page/r/<SHORT_CODE>/review` (krátký odkaz pro psaní recenzí – viz bod 4).
   - Alternativně: na Google.com hledejte „IZODIAMANT Nové Hrady" → v pravém panelu klikněte „Napsat recenzi".
   - Na mobilu: Google Maps → vyhledejte „IZODIAMANT" → karta profilu → záložka **Reviews** → tlačítko **Rate**.
2. Přihlaste se Google účtem (kdokoli s Google účtem může psát recenzi; účet musí mít alespoň 30 dní stáří, aby nebyl Googlem označen za spam).
3. **Klikněte na 5 hvězdiček** (nebo upřímně podle prožitku).
4. **Napište 3–5 vět**: co jste si objednali, kdy, jak proběhla komunikace, jaká byla cena vs. dohoda, výsledek. Specifické zmínky („diamantové lano", „kamenné zdivo", „Pardubice") pomáhají SEO.
5. (Volitelné) **Přidejte fotografii** výsledku.
6. **Odeslat**. Recenze se obvykle zobrazí do několika minut, někdy ji Google chvíli filtruje.

---

## 4. Jak pomoci zákazníkovi napsat recenzi (postup pro IZODIAMANT)

### 4.1 Krátký odkaz pro recenze
Google poskytuje krátký „review link" tvaru `https://g.page/r/<CODE>/review`. Získání:

1. Přihlaste se na <https://business.google.com> jako vlastník.
2. V dashboardu vyberte profil **IZODIAMANT**.
3. Sekce **Home → „Get more reviews"** → klikněte **Share review form** – Google ukáže krátkou URL ve tvaru `https://g.page/r/...`.
4. Tento odkaz si uložte do CRM / emailové šablony / vizitky.

### 4.2 Doporučený proces po realizaci
1. **Den 1 po dokončení**: telefonicky / SMS poděkujte za důvěru. Zeptejte se, zda je vše v pořádku.
2. **Den 2–3**: e-mailem pošlete krátký, osobní text s odkazem. Příklad:

    > Dobrý den, pane Nováku,
    >
    > moc děkujeme, že jste si vybrali IZODIAMANT pro sanaci zdiva ve Vašem domě. Pokud jste s prací spokojeni, **velmi by nám pomohla krátká recenze na Googlu**: <https://g.page/r/CODE/review> (stačí 2–3 věty, zabere to minutu). Pomáhá to dalším majitelům domů najít ověřené odborníky.
    >
    > Pokud jste cokoliv řešili, dejte nám prosím vědět nejdříve nám – rádi to s vámi doladíme.
    >
    > S díky, tým IZODIAMANT, +420 737 017 012

3. **QR kód**: ze stejné krátké URL vygenerujte QR kód (např. <https://qr-code-generator.com>) a vytiskněte na vizitku nebo děkovný leták předávaný po realizaci.

### 4.3 Co dělat NESMÍTE
- **Nenabízejte slevu / dárek výměnou za recenzi** – porušení Google Review Policy → smazání recenzí + možná penalizace profilu.
- **Nepište si recenze sami** (ani z účtů zaměstnanců nebo rodiny). Google to detekuje a profil sankcionuje.
- **Nepřesvěrujte zákazníka, jakou recenzi má napsat.** Můžete poprosit o upřímnou recenzi, nic víc.
- **Nenajímejte recenzní farmy / mass campaigns** – okamžitý filter Google + ztráta důvěryhodnosti.

---

## 5. Integrace s webem IZODIAMANT.cz

Po dokončení bodů 1–4 doplňte tyto proměnné prostředí:

### Cloudflare Pages (frontend)
- `NEXT_PUBLIC_GOOGLE_MAPS_URL` = adresa profilu (např. `https://www.google.com/maps/place/IZODIAMANT/...`)
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = verifikační token z Google Search Console (HTML tag method)

### Cloudflare Worker (`izodiamant-reviews-api`)
- `GOOGLE_PLACE_ID` = `ChIJ...`
- `GOOGLE_API_KEY` = `AIza...` (Secret)
- `FIRMY_PROFILE_URL` = stávající URL profilu na Firmy.cz

Po nasazení worker vrací recenze ze **Seznam Firmy.cz** i **Google** ve sjednoceném tvaru (`source: 'firmy' | 'google'`) – komponenta `HomeReviews` je vykreslí v jednotném designu s odznakem zdroje.

**Souhrnné skóre (badge):** v hero sekci i v patičce se vedle odznaku Mapy.com automaticky objeví i **odznak s Google skóre** (celkové hodnocení + počet recenzí), jakmile worker začne vracet `sources.google` s `rating > 0`. Odznak čte data z workeru (`NEXT_PUBLIC_REVIEWS_API_URL`) a odkazuje na `NEXT_PUBLIC_GOOGLE_MAPS_URL`. Dokud profil neexistuje / nemá recenze, odznak se nevykreslí (je „dormantní"). Není tedy potřeba nic ručně zapínat – stačí doplnit `GOOGLE_PLACE_ID` + `GOOGLE_API_KEY` ve workeru a `NEXT_PUBLIC_GOOGLE_MAPS_URL` v Pages.

---

## 6. Google Search Console (samostatně, ale související)

1. <https://search.google.com/search-console> → **Add property** → **URL prefix** → `https://izodiamant.cz`.
2. **Verification method**: doporučeno **HTML tag**. Token vložte do `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` v Pages – meta tag se vykreslí automaticky.
3. Po ověření odešlete sitemapu: **Sitemaps → Add a new sitemap** → `sitemap.xml`.
4. Sledujte:
   - **Performance** (kliky, imprese, CTR, pozice) – hlavní KPI.
   - **Pages** (Coverage) – jestli Google indexuje všechny stránky včetně `/mesta/*`.
   - **Core Web Vitals** – LCP/CLS/INP musí být zelené (LCP < 2,5 s).
   - **Mobile Usability** – musí být bez chyb.

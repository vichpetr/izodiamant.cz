# GA4: návštěvnost a kampaně

## Aktivace

1. V Google Analytics vytvořte službu GA4 a webový stream pro `https://izodiamant.cz`. Zkopírujte Measurement ID `G-…`.
2. Nastavte veřejnou build proměnnou `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…` v prostředí, kde vzniká produkční build. Není to tajný klíč. Změna vyžaduje nový build; samotná runtime proměnná nestačí. Pro preview použijte samostatný testovací stream nebo ID nenastavujte.
3. Ve streamu zapněte Rozšířené měření → Zobrazení stránek → změny stránky podle historie prohlížeče. Web používá Next.js navigaci. Nepřidávejte další ruční page_view ani paralelní GA tag v GTM, jinak vzniknou duplicity.
4. Událost `generate_lead` označte jako klíčovou událost. `click_to_call` a `click_to_email` sledujte zvlášť: kliknutí nepotvrzuje uskutečněný hovor ani odeslaný e-mail.
5. V Administrátor → Vlastní definice založte dimenze rozsahu Událost: `form_source`, `contact_method`, `service`, případně `page_path`. Zdroj, médium a kampaně mají standardní dimenze, vlastní definice nepotřebují.
6. Propojte Google Ads a zapněte automatické značkování. Importujte `generate_lead` jako konverzi jen jednou. Odhad ceny z kalkulačky je orientační hodnota zakázky, nikoli skutečné tržby nebo zisk; pro optimalizaci nabídek ho používejte až po vyhodnocení kvality leadů.

Tato změna nevytváří GA účet, nemění jeho administraci a nenasazuje web. Aktivaci potvrďte kontrolou reálného streamu po nasazení.

## Co se měří

| Událost | Spouštěč | Parametry |
| --- | --- | --- |
| `page_view` | Načtení GA a navigace přes historii při zapnutém rozšířeném měření | Standardní URL, referrer, název stránky |
| `generate_lead` | Úspěšná odpověď serveru po odeslání poptávky | `form_source`, `page_path`; kalkulačka také `service`, případně `value` a `currency=CZK` |
| `click_to_call` | Kliknutí na odkaz `tel:` | `contact_method=phone`, `page_path` |
| `click_to_email` | Kliknutí na odkaz `mailto:` | `contact_method=email`, `page_path` |

GA se načítá po souhlasu, bez čekání na další scroll nebo kliknutí. Bez souhlasu se aplikační události ani nezařazují do fronty. Nedostupné úložiště znamená chybějící souhlas. Telefonní číslo ani e-mail nejsou parametrem kontaktních událostí. Do názvů kampaní, URL, nadpisů a parametrů nikdy nedávejte osobní údaje; standardní GA měření může odesílat URL a názvy stránek. V GA zapněte redakci e-mailů a citlivých query parametrů. Administraci a interní návštěvy z reportů vylučte pomocí odpovídajícího nastavení a ověřených filtrů.

Návštěvníci bez souhlasu nebo s blokátorem nebudou plně změřeni. Při souhlasu až po přechodu na jinou stránku mohou chybět původní UTM parametry. Měření nereprodukuje historii před souhlasem. Kliknutí na telefon není důkaz objednávky; skutečný počet a cenu zakázek je třeba doplnit z obchodní evidence.

## Jednotné značení kampaní

Používejte malá písmena, bez diakritiky a stejné názvy napříč kampaněmi. UTM přidávejte pouze na příchozí externí odkazy, nikoli na interní odkazy webu.

| Parametr | Význam | Příklad |
| --- | --- | --- |
| `utm_source` | Platforma nebo partner | `facebook`, `seznam`, `newsletter` |
| `utm_medium` | Typ návštěvnosti | `paid_social`, `cpc`, `email` |
| `utm_campaign` | Konkrétní kampaň | `sanace-jaro-2027` |
| `utm_content` | Varianta reklamy | `video-vlhke-zdivo-a` |
| `utm_term` | Klíčové slovo, pokud je potřeba | `podrezani-zdiva` |
| `utm_id` | Stabilní ID kampaně pro propojení s náklady | `meta-2027-01` |

Příklad reklamy na Facebooku:

`https://izodiamant.cz/?utm_source=facebook&utm_medium=paid_social&utm_campaign=sanace-jaro-2027&utm_content=video-vlhke-zdivo-a&utm_id=meta-2027-01`

Google Ads používejte s automatickým značkováním (`gclid`); nenahrazujte ho nahodilými ručními UTM. U Skliku a dalších sítí nastavte UTM v cílových URL / měřicích šablonách. Zachovejte query parametry při přesměrováních.

## Vyhodnocování

V přehledu Získávání návštěvnosti porovnávejte **Zdroj / médium relace** a **Kampaň relace** podle relací, míry zapojení, `generate_lead` a podílu relací s touto klíčovou událostí. Telefon a e-mail vyhodnocujte jako další kontaktní signály. Přehled Získávání uživatelů odpovídá na první získání uživatele, nikoli na výkon konkrétní návštěvy.

V Průzkumech připravte tabulku: kampaň → zdroj / médium → vstupní stránka, metriky relace a události podle názvu. Porovnávejte také zařízení a regiony. Výdaje doplňte z Ads nebo importu nákladů; cena za poptávku = výdaje / počet `generate_lead`. Návratnost vyžaduje skutečné tržby a potvrzené zakázky, samotná návštěvnost ji neukazuje.

## Ověření před spuštěním

- V čistém prohlížeči bez souhlasu ani po odmítnutí nesmí vzniknout požadavek na `gtag/js` ani GA `collect`.
- Otevřete UTM odkaz, povolte analytiku a ověřte jedno počáteční `page_view`. Přes interní odkazy přejděte na další dvě stránky: každá musí mít právě jedno nové `page_view`. Kontrolujte síť i GA Realtime / DebugView s Tag Assistantem.
- Odešlete formulář a kalkulačku: po úspěchu musí přijít `generate_lead`, při chybě serveru nesmí. Zkontrolujte rozlišení `form_source` a odhad hodnoty kalkulačky.
- Klikněte na telefon i e-mail a ověřte samostatné události bez adres či telefonních čísel v jejich parametrech.
- Opakujte návštěvu s uloženým souhlasem bez další interakce: GA musí naběhnout. Odvolejte souhlas dostupným ovládáním cookies a zkontrolujte zastavení měření.
- Zkontrolujte Zdroj / médium a Kampaň relace po zpracování dat; běžné reporty nemusí být dostupné okamžitě.

Lokální automatické ověření: `node --test tests/unit/analytics.test.mjs`.

Reference: [Měření stránek](https://developers.google.com/analytics/devguides/collection/ga4/views), [SPA měření](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [Konfigurace GA4](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).

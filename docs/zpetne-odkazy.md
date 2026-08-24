# Zpětné odkazy (backlinky) – plán pro IZODIAMANT

Bing Webmaster Tools hlásí nález **„Your site lacks inbound links from high-quality
domains"** (Moderate, 1 error). Není to chyba v kódu webu – nic se nedá opravit
commitem. Znamená to, že na `izodiamant.cz` míří příliš málo odkazů z důvěryhodných
domén, takže Bing (a stejně tak Seznam i Google) nemá čím potvrdit autoritu webu.

Řešení je **mimo repozitář**: postupně získat odkazy z relevantních českých domén.
Tenhle dokument je pracovní seznam – co je hotové, co udělat a v jakém pořadí.

## Pravidla, která platí u každého odkazu

- **NAP musí být všude identické** jako na webu a v `public/llms.txt`:
  IZODIAMANT · Mokrá Lhota 26, 539 44 Nové Hrady · +420 737 017 012 ·
  <https://izodiamant.cz>. Rozdílný zápis adresy zeslabuje lokální signál
  (viz `.claude/skills/site-invariants/SKILL.md`, pravidlo 7).
- **Nikdy neplatit za balíčky odkazů** („100 odkazů za 990 Kč"). Bing i Google to
  detekují jako link spam a nález tím nezmizí – jen přibude riziko postihu.
- **Odkazovat na konkrétní podstránku**, ne pořád na homepage: služby
  (`/sluzby/diamantove-lano`, `/sluzby/retezova-pila`, `/sluzby/chemicka-injektaz`),
  reference (`/reference/<id>`) a články (`/clanky/<slug>`).
- **Popisky služeb musí odpovídat skutečné nabídce** – firma nedělá vysoušení ani
  elektroosmózu (stejné pravidlo jako pro `faq.json` a `llms.txt`).
- Ceny v katalozích uvádět **za běžný metr (bm) při tloušťce 45 cm**, jinak číslo
  vypadá jako cena za celou zakázku.

## 1. Hotové / rozjeté

- **Firmy.cz (Seznam)** – profil existuje, web z něj čerpá recenze
  (`NEXT_PUBLIC_FIRMY_PROFILE_URL`). Zkontrolovat, že profil obsahuje odkaz na web.
- **Google Business Profile** – postup a stav v `docs/google-business-profile.md`.
  Web + Služby musí odkazovat na `https://izodiamant.cz` (bez UTM, ať se odkaz počítá).
- **Facebook stránka** – posty k referencím a článkům chodí automaticky
  (viz workflow k FB posterům). Každý post odkazuje na konkrétní URL na webu.

## 2. Katalogy a zápisy (nejrychlejší zisk, udělat jako první)

Zdarma nebo za symbolickou částku, u všech vyplnit stejné NAP a odkaz na web:

| Kde | Poznámka |
| --- | --- |
| Bing Places for Business | přímo protějšek Bingu, který nález hlásí – nejvyšší priorita |
| Mapy.com / Firmy.cz | ověřit úplnost profilu (fotky, služby, ceny za bm) |
| Živéfirmy.cz, Najisto.cz, Zlatestranky.cz | obecné katalogy s dlouhou historií |
| Rejstřík firem (rejstrik-firem.kurzy.cz, edb.cz) | zápis z veřejných dat – doplnit web |
| ePoptávka.cz, Nejřemeslníci.cz, Poptávej.cz | poptávkové portály: odkaz + reálné zakázky |
| Regionální katalogy (Pardubický, Královéhradecký kraj) | lokální relevance k servisní oblasti |

Kontrola po zápisu: profil musí být veřejný a odkaz **bez `rel="nofollow"` v ideálním
případě** – i nofollow odkaz ale pomáhá k tomu, aby web našly crawlery.

## 3. Obsahové odkazy (pomalejší, ale kvalitnější)

- **Stavební a rekonstrukční magazíny** – nabídnout odborný text na téma, na které už
  máme článek (`/clanky/jak-poznat-vzlinajici-vlhkost`, `/clanky/podrezani-nebo-injektaz`,
  `/clanky/cena-sanace-vlhkeho-zdiva`). Text psát jako radu, ne jako reklamu; odkaz
  do textu na konkrétní článek nebo službu.
- **Diskuze a poradny** (eStav.cz, chatař/chalupář fóra, Facebook skupiny o
  rekonstrukcích) – odpovídat na dotazy o vlhkém zdivu a odkázat na článek jen tam,
  kde to opravdu odpovídá dotazu.
- **Dodavatelé a partneři** – výrobci hydroizolací, sanačních omítek a strojů:
  požádat o zařazení do sekce „reference / realizační firmy".
- **Zákazníci s webem** (obce, penziony, správci historických objektů z referencí) –
  u dokončené zakázky poprosit o zmínku s odkazem na detail reference. Obecní weby
  (`.cz` domény obcí) jsou pro lokální SEO velmi silné.
- **Program „Doporuč a získej odměnu"** (`/doporuc-a-ziskej-odmenu`) – při propagaci
  vždy odkazovat přímo na tuhle stránku.

## 4. Měření

- Bing Webmaster Tools → **Backlinks** (odkud odkazy vedou, srovnání s konkurencí).
- Google Search Console → **Odkazy** (externí odkazy, nejčastěji odkazované stránky).
- Cíl na první etapu: **10–15 odkazů z různých domén** (katalogy + 2–3 obsahové).
  Nález v Bingu zmizí až po dalším prolezení webu, počítat s několika týdny.

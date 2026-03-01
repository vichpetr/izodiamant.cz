# 🎯 UX & Accessibility Audit (WCAG 2.2): IZODIAMANT.CZ

**Datum auditu:** 1. března 2026
**Auditor:** Senior UX Auditor & A11y Expert
**Cílová doména:** https://www.izodiamant.cz/

Tento dokument představuje hloubkovou analýzu uživatelského zážitku (UX) a přístupnosti (Accessibility - A11y) současného webu izodiamant.cz. Cílem je identifikovat bariéry bránící konverzi a navrhnout strategická vylepšení odpovídající standardům roku 2026.

---

## 1. Vizuální aspekty a UI Design

Současný vizuální styl plní základní informační účel, ale postrádá moderní prvky budování důvěry a jasnou vizuální hierarchii potřebnou pro maximalizaci konverzí.

*   **Vizuální hierarchie:** Stránka trpí vysokou informační hustotou ("text-heavy" přístup). Bloky textu, zejména v sekci článků a technických specifikací, splývají, což znesnadňuje rychlé skenování obsahu. Chybí jasné oddělení sekcí pomocí "white space" (bílého prostoru).
*   **Kontrast barev:** Byly identifikovány potenciální problémy s kontrastem (např. text na fotografiích z realizací bez dostatečného overlaye). Pro splnění WCAG 2.2 AA standardu (kontrast 4.5:1 pro běžný text) je nutné revidovat paletu, zejména u menších popisků.
*   **Typografie:** Použitý font je sice čitelný, ale postrádá moderní "čistotu". Pro B2B/B2C segment stavebnictví a technologií doporučuji přechod na robustnější sans-serif rodinu (např. Inter, Roboto) ve více řezech pro jasnější strukturování nadpisů (H1-H6).
*   **Navigace:** Navigace je funkční, ale na mobilních zařízeních může být skrytí důležitých CTA (Call to Action) do "hamburger" menu překážkou.

## 2. Přístupnost (Accessibility - WCAG 2.2)

Audit odhalil několik oblastí, kde web nesplňuje moderní standardy přístupnosti, což může omezovat část uživatelů a zhoršovat SEO hodnocení.

*   **ARIA role a sémantika:** 
    *   **Duplicita čteček:** Prvky jako "Facebook Facebook" nebo "Telefon Telefon" v hlavičce/patičce naznačují chybějící `aria-hidden="true"` u ikon. Čtečky obrazovky tak předčítají obsah duplicitně, což je pro zrakově postižené uživatele matoucí.
    *   **Skip Links:** Pozitivním prvkem je přítomnost "Přeskočit na obsah", nicméně je nutné ověřit, zda skutečně přesouvá focus klávesnice, nejen vizuální viewport.
*   **Klávesnicová navigace (Tab order):** Interaktivní prvky (zejména rozbalovací nabídky a formulářové prvky) musí mít zřetelný stav `:focus-visible`. Aktuálně je vizuální odezva při procházení tabulátorem nedostatečná.
*   **Interaktivní prvky:** Odkazy na telefonní čísla a e-maily musí striktně využívat protokoly `tel:` a `mailto:`, aby byly plně funkční pro mobilní uživatele i asistenční technologie.

## 3. Výkon živé aplikace (Core Web Vitals a Responzivita)

*   **Rychlost načítání (LCP / CLS):** Přestože jde primárně o obsahový web, načítání obrázků z referencí bez optimalizace (chybějící lazy-loading a moderní formáty jako WebP/AVIF) negativně ovlivňuje Largest Contentful Paint (LCP). 
*   **Responzivita a dotykové ovládání:** 
    *   Ceníkové tabulky ("NAŠE SLUŽBY") představují riziko na mobilních zařízeních, kde hrozí horizontální scrollování rozbíjející layout stránky. Doporučuje se transformace do "card-based" layoutu na menších displejích.
    *   Dotykové plochy (Touch Targets) u odkazů v patičce a v textu jsou příliš blízko sebe. WCAG 2.2 vyžaduje minimální velikost dotykového cíle 24x24 CSS pixelů.
*   **Efektivita formulářů:** Kontaktní formulář postrádá inline validaci v reálném čase a jasné chybové hlášky svázané s konkrétními poli pomocí `aria-describedby`.

## 4. Moderní UX trendy pro rok 2026

Pro transformaci z "digitální vizitky" na "konverzní platformu" je nutné implementovat následující přístupy:

*   **Mikrointerakce:** Poskytování okamžité zpětné vazby uživateli. Například hover efekty nad referencemi (jemné přiblížení fotografie), haptická/vizuální odezva při odeslání poptávky nebo "skeleton loading" při načítání dynamického obsahu.
*   **Minimalismus a "Scrollytelling":** Uživatel by neměl číst suchý text o podřezávání zdiva. Proces by měl být vizualizován pomocí animací spouštěných scrollováním (např. ilustrace zdiva a diamantového lana), čímž se složitý technický proces stane pochopitelným na první pohled.
*   **Personalizované uživatelské cesty:** Homepage by měla rychle segmentovat návštěvníky (např. "Mám vlhký sklep" vs. "Jsem stavební firma"). Tím se zkrátí cesta ke konverzi.

---

## 🚨 Critical Issues (Kritické chyby k okamžitému řešení)

1.  **Redundantní a matoucí podpora asistenčních technologií:** Ikony v hlavičce a patičce postrádají správné ARIA atributy, což vede k duplicitnímu čtení textů (např. "Facebook Facebook"). *Dopad: Blokátor přístupnosti, porušení WCAG.*
2.  **Absence primárního "Hero" CTA:** Úvodní sekce webu (Above the Fold) neobsahuje žádné jasné tlačítko vyzývající k akci (např. "Spočítat cenu"). Uživatelé tak nejsou okamžitě navedeni do konverzního trychtýře. *Dopad: Zásadní ztráta potenciálních leadů.*
3.  **Mobilní layout ceníků:** Zobrazení technických specifikací a cen formou komplexních tabulek způsobuje na mobilních zařízeních nepřehlednost a narušuje responzivitu. *Dopad: Vysoký bounce rate na mobilních telefonech.*
4.  **Nedostatečný indikátor focusu:** Pro uživatele navigující pomocí klávesnice chybí jasné a kontrastní orámování aktivních prvků (`:focus-visible`). *Dopad: Omezení přístupnosti pro uživatele s motorickým postižením.*

## ⚡ Quick Wins (Doporučení s vysokým dopadem na konverzi)

1.  **Sticky konverzní lišta pro mobily (Mobile Sticky Header):** Ukotvěte na spodní nebo horní okraj obrazovky na mobilních zařízeních trvale viditelné tlačítko pro rychlý kontakt ("Zavolat" - `tel:` odkaz) a "Poptat kalkulaci". Tím zajistíte, že CTA bude dostupné bez ohledu na hloubku scrollování.
2.  **Transformace Hero sekce:** Vyměňte textově obsáhlý úvod za silný value proposition (např. "Trvalé odstranění vlhkosti diamantovým řezem") doplněný o kontrastní CTA tlačítko a důvěryhodný prvek (např. "Záruka X let", "Více než 500 realizací").
3.  **Vizuální kotvy v ceníku:** Zvýrazněte (tučným řezem, pozadím) sloupec nebo hodnotu s finální "Cenou za m²", aby uživatel při skenování tabulky ihned našel to nejdůležitější bez nutnosti studovat celou strukturu.
4.  **Optimalizace formuláře (Inline validace):** Zaveďte kontrolu zadaných údajů (např. formát e-mailu nebo telefonu) v reálném čase ihned po opuštění políčka, nikoliv až po pokusu o odeslání. Přidejte zřetelná ujištění ("Vaše data jsou v bezpečí").
5.  **Lokální Social Proof:** Na domovskou stránku vytáhněte 3 nejlepší nedávné reference ve formátu vizuálně atraktivních "karet" (Před / Po + Lokalita), což funguje jako nejsilnější prodejní argument.
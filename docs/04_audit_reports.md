UX: Provedl jsem detailní UX a A11y analýzu webu **izodiamant.cz**. Výsledný audit, který identifikuje kritické chyby v přístupnosti (WCAG 2.2) a navrhuje "Quick Wins" pro okamžité zvýšení konverze, byl úspěšně vygenerován a uložen jako `04_ux_audit.md` v projektovém adresáři.

Dokument analyzuje současný vizuální styl (kontrasty, text-heavy přístup), hodnotí sémantiku a ARIA prvky (duplicita ikon pro čtečky), mapuje rychlost a responzivitu tabulek, a definuje nezbytné transformace pro moderní UX v roce 2026 (scrollytelling, mikrointerakce).


SEO: Jako Senior SEO Specialist a expert na sémantiku předkládám kompletní návrh SEO on-page parametrů pro projekt **IZODIAMANT 2026**. Strategie reflektuje moderní trendy vyhledávání (Search Generative Experience), kde hraje prim autorita (E-E-A-T) a jasná hierarchie dat.

---

### 1. Meta Tagy (CTR & Relevance)

Navržené texty kombinují technickou autoritu s konverzními prvky.

*   **Title:** `Podřezávání a sanace vlhkého zdiva | IZODIAMANT 2026`
    *   *Zdůvodnění:* Primární klíčové slovo na začátku, oddělovač a silný brand. Délka cca 55 znaků (ideální pro zobrazení na mobilech i desktopu).
*   **Description:** `Hledáte definitivní řešení vlhkého zdiva? Specializujeme se na podřezávání diamantovým lanem se 100% zárukou. Získejte odhad ceny v naší online kalkulačce!`
    *   *Zdůvodnění:* Začíná otázkou (bolestivý bod zákazníka), obsahuje USP (diamantové lano, záruka) a jasný Call-to-Action (kalkulačka).
*   **OpenGraph Title:** `IZODIAMANT: Moderní technologie pro suchý dům`
*   **OpenGraph Description:** `Průvodce sanací zdiva pro 21. století. Podívejte se, jak zachraňujeme stavby pomocí diamantového lana.`

---

### 2. Sémantická struktura nadpisů (H1–H4)

Logický sled pro crawlery, který mapuje celou informační architekturu stránky.

*   **H1: Profesionální podřezávání a sanace vlhkého zdiva**
    *   *(Pouze jedna na stránce, obsahuje hlavní klíčové slovo)*
*   **H2: Technologie diamantového lana: Definitivní řešení vlhkosti**
    *   *H3: Jak funguje řezání diamantovým lanem?*
    *   *H3: Výhody oproti klasickému podřezávání řetězovou pilou*
*   **H2: Kalkulačka ceny podřezání zdiva v reálném čase**
    *   *(Focus na konverzi a uživatelskou hodnotu)*
*   **H2: Reference a realizace: Tisíce suchých domů po celé ČR**
    *   *H3: Sanace historických objektů a kamenného zdiva*
    *   *H3: Izolace rodinných domů a novostaveb*
*   **H2: Proč svěřit izolaci základů právě nám?**
    *   *H3: Certifikované materiály a 20+ let zkušeností*
    *   *H3: Čistota a šetrnost k statice budovy*
*   **H4: Často kladené dotazy k sanaci zdiva**
    *   *(Pomocné nadpisy pro FAQ sekci)*

---

### 3. Strukturovaná data (JSON-LD)

Pro rok 2026 je kritické definovat web jako `LocalBusiness` a `Service` pro získání Rich Snippets (hvězdičky, lokální pack).

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HomeAndConstructionBusiness",
      "name": "IZODIAMANT",
      "url": "https://izodiamant.cz",
      "logo": "https://izodiamant.cz/logo.png",
      "image": "https://izodiamant.cz/og-image.jpg",
      "description": "Specialisté na sanace vlhkého zdiva a podřezávání diamantovým lanem.",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "XX.XXXX",
        "longitude": "YY.YYYY"
      },
      "priceRange": "$$$"
    },
    {
      "@type": "Service",
      "serviceType": "Podřezávání zdiva",
      "provider": { "@type": "LocalBusiness", "name": "IZODIAMANT" },
      "areaServed": "Czech Republic",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Sanace zdiva",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": { "@type": "Service", "name": "Podřezávání diamantovým lanem" }
          },
          {
            "@type": "Offer",
            "itemOffered": { "@type": "Service", "name": "Chemická injektáž zdiva" }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "Jaká je cena za metr podřezání zdiva?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cena se odvíjí od tloušťky a materiálu zdiva. Pro přesný odhad využijte naši online kalkulačku."
        }
      }]
    }
  ]
}
```

---

### 4. SEO Doporučení pro vývojáře

1.  **Image SEO:** Každá fotka z realizace musí mít `alt` tag (např. `alt="Podřezávání kamenného zdiva diamantovým lanem v Praze"`).
2.  **LCP Optimization:** Hero image (pozadí s betonem) musí být v moderním formátu **AVIF** s nastaveným `priority` v `next/image`.
3.  **Semantic HTML:** Pro ceník použít tag `<table>`, pro reference `<article>`, pro navigaci `<nav>`.
4.  **Internal Linking:** V textu o technologii odkazovat na kalkulačku pomocí kotvy "zjistit cenu sanace".

Tento návrh zajistí, že **izodiamant.cz** nebude jen vizuálně přitažlivý, ale stane se vyhledávanou autoritou v oboru s vysokou mírou prokliku z organických výsledků.

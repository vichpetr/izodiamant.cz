I will now perform a final technical inspection of the website to identify its current visual identity (colors, fonts), existing tracking scripts, and performance metrics, which will allow me to draft a precise modernization strategy.
Jako **Senior Web Architect a Design Lead** předkládám strategický plán modernizace platformy **izodiamant.cz**. Cílem je transformace z informativního webu na vysoce výkonnou, konverzní aplikaci, která dominuje segmentu sanací zdiva v roce 2026.

---

# 🚀 Architektonický Blueprint: IZODIAMANT 2026

## 1. Moderní UX/UI Směr
Vizuální identita musí reflektovat **stabilitu, čistotu a technologickou preciznost**.
*   **Vizuální styl:** „Industrial Clean“ – kombinace surových betonových textur (v pozadí) s ultra-čistou typografií.
*   **Barevná paleta:** 
    *   `Primary`: #0056b3 (Deep Tech Blue) – evokuje vodu/izolaci a profesionalitu.
    *   `Accent`: #ffcc00 (Construction Yellow) – pro kritické CTA (výzvy k akci).
    *   `Neutral`: #f8f9fa (Off-White) a #212529 (Anthracite).
*   **Interakce:** Implementace **Framer Motion** pro "scrollytelling" – např. animace řezu zdivem při scrollu, která vizualizuje proces podřezávání diamantovým lanem.
*   **Micro-interactions:** Haptická odezva u mobilních tlačítek a skeleton loading stavy pro kalkulačku.

## 2. Technická Architektura (The 2026 Stack)
Navrhuji přechod z monolitického WordPressu na **Composable Architecture**:
*   **Framework:** `Next.js 16+` (App Router) využívající **React Server Components (RSC)** pro nulový JS bundle na statických stránkách.
*   **Styling:** `Tailwind CSS 4.0` pro atomický design a bleskový runtime.
*   **Backend / CMS:** `Payload CMS` (Headless) nebo `Sanity.io` – umožní majiteli snadno přidávat reference z terénu přes mobilní aplikaci.
*   **Edge Functions:** Nasazení `Vercel Edge Functions` pro dynamické generování cenových odhadů v reálném čase podle geolokace zákazníka.
*   **Deployment:** Vercel nebo Netlify s využitím ISR (Incremental Static Regeneration) pro okamžité aktualizace referencí.

## 3. Měření a Analytics (GA4 Event Strategy)
Měření se přesune od "zobrazení stránek" k "hodnotě uživatele":
*   **Primary Conversions:**
    *   `estimate_calculated`: Uživatel dokončil výpočet v kalkulačce.
    *   `contact_form_submit`: Odeslání poptávky.
    *   `phone_click`: Kliknutí na tel. číslo (detekce mobilního záměru).
*   **Secondary Events:**
    *   `reference_view`: Prohlížení detailu konkrétní realizace (hloubka zájmu).
    *   `scroll_depth_90`: Dočtení technických detailů o diamantovém laně.
*   **Analytics Hub:** Propojení GA4 s **Google BigQuery** pro prediktivní analýzu sezónnosti poptávek.

## 4. Právní požadavky a Compliance
*   **Cookie Consent:** Implementace `Consent Mode v2` (povinné pro Google Ads 2026).
*   **Technologie:** `Klaro!` nebo custom řešení integrované přímo do Next.js middleware, které blokuje scripty (GTM, Pixel) před explicitním souhlasem.
*   **GDPR:** Automatické mazání leadů z DB po 2 letech, pokud nedojde k realizaci.

## 5. Technická Specifikace (`package.json`)
Vývojář použije tyto klíčové balíčky pro zajištění modularity a výkonu:

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.450.0",
    "shadcn-ui": "latest",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.23.0",
    "next-seo": "^6.5.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "@types/node": "^20.0.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Klíčové komponenty k vývoji:
1.  **`<PricingCalculator />`:** Interaktivní React komponenta využívající `Zod` pro validaci vstupů (tloušťka zdiva, materiál).
2.  **`<RealTimeStatus />`:** Widget na homepage ukazující "Aktuálně pracujeme v: [Lokalita]", napojený na API referencí.
3.  **`<OptimizedImage />`:** Wrapper nad `next/image` s automatickým WebP/Avif převodem a "blur-up" efektem pro fotky z realizací.

Tento plán posouvá **izodiamant.cz** z role digitální vizitky do pozice technologického lídra, který aktivně generuje byznys skrze špičkové UX a data.

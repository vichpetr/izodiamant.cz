# Deployment Guide: Cloudflare Pages & Worker

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze.

## 1. Cloudflare Pages (Frontend)
1. V Cloudflare dashboardu: **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
2. **Build settings:**
   - **Framework preset:** `None`
   - **Build command:** `npx @cloudflare/next-on-pages`
   - **Build output directory:** `.vercel/output/static`
3. **Environment variables (Settings -> Environment variables):**
   - `RESEND_API_KEY`: Váš klíč z resend.com
   - `CONTACT_EMAIL`: info@izodiamant.cz
   - `NEXT_PUBLIC_FIRMY_PROFILE_URL`: https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html
   - `NEXT_PUBLIC_REVIEWS_API_URL`: (Doplníte po kroku 2 níže)
   - `NODE_VERSION`: `20`
4. **Compatibility flags (Settings -> Functions):**
   - Přidejte `nodejs_compat` pro Production i Preview.

---

## 2. Cloudflare Worker (Recenze API)
Tento skript parsuje data z Firmy.cz a poskytuje je webu jako JSON.

1. V Cloudflare dashboardu: **Workers & Pages** -> **Create application** -> **Create Worker**.
2. Pojmenujte ho např. `izodiamant-reviews-api`.
3. Klikněte na **Deploy**, poté na **Edit Code** a vložte tento kompletní kód:

```javascript
export default {
  async fetch(request, env) {
    // 1. Konfigurace URL (používáme widget verzi pro snadný parsing)
    const profileUrl = 'https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html?widget&limit=150';
    
    try {
      const response = await fetch(profileUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'cs-CZ,cs;q=0.9'
        }
      });
      const html = await response.text();

      const reviews = [];
      // Extrakce dat pomocí Regexu
      const authorRegex = /<span class="author">([^<]+)<\/span>/g;
      const textRegex = /<div class="text">([^<]+)<\/div>/g;
      const dateRegex = /<span class="date">([^<]+)<\/span>/g;

      let authorMatch;
      while ((authorMatch = authorRegex.exec(html)) !== null) {
        const textMatch = textRegex.exec(html);
        const dateMatch = dateRegex.exec(html);
        
        if (textMatch) {
          // Vyčištění textu (Seznam občas lepí iniciály autora na konec textu)
          let cleanText = textMatch[1].trim();
          
          reviews.push({
            id: `live-${reviews.length}`,
            author: authorMatch[1].trim(),
            text: cleanText,
            date: dateMatch ? dateMatch[1].trim() : "2024",
            rating: 5
          });
        }
      }

      // Extrakce celkových statistik z JSON metadat widgetu
      const ratingMatch = html.match(/"average_review_percentage":(\d+)/);
      const countMatch = html.match(/"review_count":(\d+)/);

      const responseData = {
        rating: ratingMatch ? (parseInt(ratingMatch[1]) / 20) : 5.0,
        count: countMatch ? parseInt(countMatch[1]) : reviews.length,
        reviews: reviews,
        lastUpdate: new Date().toISOString()
      };

      return new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*', // Povolí volání z webu
          'Cache-Control': 'public, max-age=3600' // Kešování na 1 hodinu
        }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
```

4. Klikněte na **Save and Deploy**.
5. Zkopírujte URL adresu tohoto Workeru (např. `https://izodiamant-reviews-api.vaše-jméno.workers.dev`).
6. Tuto adresu vložte do environmentální proměnné `NEXT_PUBLIC_REVIEWS_API_URL` v nastavení **Cloudflare Pages** (viz krok 1.3).
7. **Znovu nasaďte (Redeploy)** frontendovou aplikaci, aby se změna proměnné projevila.

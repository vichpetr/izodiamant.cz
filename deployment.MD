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
   - `NEXT_PUBLIC_REVIEWS_API_URL`: URL adresa vašeho Workeru
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
      const itemRegex = /<div class="item">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
      const authorRegex = /<div class="authorName">\s*<span>([^<]+)<\/span>/;
      const dateRegex = /<span class="date">([^<]+)<\/span>/;
      const textRegex = /<div class="text">([^<]+)<\/div>/;

      let itemMatch;
      while ((itemMatch = itemRegex.exec(html)) !== null) {
        const itemHtml = itemMatch[1];
        const author = itemHtml.match(authorRegex);
        const date = itemHtml.match(dateRegex);
        const text = itemHtml.match(textRegex);

        if (author && text) {
          reviews.push({
            id: `live-${reviews.length}`,
            author: author[1].trim(),
            text: text[1].trim(),
            date: date ? date[1].trim() : "2024",
            rating: 5
          });
        }
      }

      const countMatch = html.match(/<span class="ratingCount">(\d+)\s*hodnocení<\/span>/);
      const totalCount = countMatch ? parseInt(countMatch[1]) : reviews.length;

      return new Response(JSON.stringify({
        rating: 5.0,
        count: totalCount,
        reviews: reviews,
        lastUpdate: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
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
5. Adresu Workeru vložte do `NEXT_PUBLIC_REVIEWS_API_URL` v nastavení Pages.

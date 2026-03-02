# Deployment Guide: Cloudflare Pages & Worker

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze.

## 1. Cloudflare Pages (Frontend)
...

## 2. Cloudflare Worker (Recenze API)
Tento skript parsuje data z Firmy.cz a poskytuje je webu jako JSON.

1. V Cloudflare dashboardu: **Workers & Pages** -> **Create application** -> **Create Worker**.
2. Pojmenujte ho např. `izodiamant-reviews-api`.
3. Klikněte na **Deploy**, poté na **Edit Code** a vložte tento kompletní kód:

```javascript
export default {
  async fetch(request, env) {
    const profileUrl = 'https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html?widget&limit=150';
    
    const createSlug = (text) => {
      return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .trim();
    };

    const normalizeDate = (dateStr) => {
      const parts = dateStr.split('.').map(p => p.trim());
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return dateStr;
    };

    try {
      const response = await fetch(profileUrl, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'cs-CZ,cs;q=0.9'
        }
      });
      const html = await response.text();

      const blocks = html.split('<div class="item">').slice(1);
      const reviews = [];

      blocks.forEach(block => {
        const authorMatch = block.match(/<div class="authorName">\s*<span>([^<]+)<\/span>/);
        const dateMatch = block.match(/<span class="date">([^<]+)<\/span>/);
        const textMatch = block.match(/<div class="text">([\s\S]*?)<\/div>/);
        const ratingMatch = block.match(/title="(\d+) %"/);

        if (authorMatch && textMatch) {
          const authorName = authorMatch[1].trim();
          const cleanDate = dateMatch ? normalizeDate(dateMatch[1].trim()) : "2024-01-01";
          const stars = ratingMatch ? (parseInt(ratingMatch[1]) / 20) : 5;
          
          reviews.push({
            id: `${cleanDate}-${createSlug(authorName)}`,
            author: authorName,
            text: textMatch[1].trim().replace(/<[^>]*>?/gm, ''),
            date: cleanDate,
            rating: stars
          });
        }
      });

      const statsMatch = html.match(/<div class="badge green">\s*([\d,]+)\s*<\/div>/);
      const countMatch = html.match(/<span class="ratingCount">(\d+)\s*hodnocení<\/span>/);

      return new Response(JSON.stringify({
        rating: statsMatch ? parseFloat(statsMatch[1].replace(',', '.')) : 5.0,
        count: countMatch ? parseInt(countMatch[1]) : reviews.length,
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

# Deployment Guide: Cloudflare Pages & Worker

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze.

## 1. Cloudflare Pages (Frontend)
... (beze změny) ...

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
    
    // Funkce pro odstranění diakritiky a vytvoření ID
    const createSlug = (text) => {
      return text.toString().toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .trim();
    };

    // Funkce pro převod data z "DD. MM. YYYY" na "YYYY-MM-DD"
    const normalizeDate = (dateStr) => {
      const parts = dateStr.split('.').map(p => p.trim());
      if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${y}-${m}-${d}`;
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

      const reviews = [];
      // Vylepšený regex pro zachycení celého bloku recenze (včetně vnořených divů)
      const itemRegex = /<div class="item">([\s\S]*?)<\/div>\s*(?=<div class="item">|<\/div>\s*<\/div>\s*<div class="btns">)/g;
      
      const authorRegex = /<div class="authorName">\s*<span>([^<]+)<\/span>/;
      const dateRegex = /<span class="date">([^<]+)<\/span>/;
      const textRegex = /<div class="text">([\s\S]*?)<\/div>/;

      let itemMatch;
      while ((itemMatch = itemRegex.exec(html)) !== null) {
        const itemHtml = itemMatch[1];
        
        const author = itemHtml.match(authorRegex);
        const dateRaw = itemHtml.match(dateRegex);
        const text = itemHtml.match(textRegex);

        if (author && text) {
          const authorName = author[1].trim();
          const cleanDate = dateRaw ? normalizeDate(dateRaw[1].trim()) : "2024-01-01";
          
          reviews.push({
            id: `${cleanDate}-${createSlug(authorName)}`,
            author: authorName,
            text: text[1].trim().replace(/<[^>]*>?/gm, ''), // Odstraní případné HTML tagy uvnitř textu
            date: cleanDate,
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

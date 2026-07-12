# Deployment Guide: Cloudflare Pages & Worker

Tento dokument popisuje proces nasazení aplikace IZODIAMANT.cz a nastavení pomocného Workeru pro živé recenze ze **Seznam Firmy.cz** a **Google Maps**.

## 1. Cloudflare Pages (Frontend)
...

## 2. Cloudflare Worker (Recenze API – Seznam + Google)

Tento Worker:
- Parsuje recenze z Firmy.cz (HTML widget).
- Načítá recenze z Google Places API (Place Details).
- Vrací sjednocenou strukturu s polem `source` (`firmy` nebo `google`) tak, aby je web mohl zobrazovat v jednotném designu a s rozlišením zdroje.

### 2.1 Co potřebujete

- **Firmy.cz profile URL** – odkaz na firemní profil (např. `https://www.firmy.cz/detail/13505805-izodiamant-...`).
- **Google Place ID** – identifikátor firmy v Google Mapách. Získání viz `docs/google-business-profile.md`.
- **Google API Key** s povolenou `Places API` (resp. „Place Details") – viz [Google Cloud Console](https://console.cloud.google.com/). Omezit API key na `Places API` a (volitelně) HTTP referrer / IP, aby nešel zneužít.

### 2.2 Vytvoření Workeru

1. V Cloudflare dashboardu: **Workers & Pages** → **Create application** → **Create Worker**.
2. Pojmenujte ho např. `izodiamant-reviews-api`.
3. Klikněte na **Deploy**, poté na **Edit Code** a vložte kód z bodu 2.4.
4. Po nasazení v záložce **Settings → Variables and Secrets** přidejte:
   - `FIRMY_PROFILE_URL` = `https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady-mokra-lhota.html?widget&limit=150`
   - `GOOGLE_PLACE_ID` = `ChIJ...` (Place ID z Google)
   - `GOOGLE_API_KEY` = `AIza...` (Secret – ne plain variable)
5. URL Workeru vložte do `NEXT_PUBLIC_REVIEWS_API_URL` v nastavení Cloudflare Pages projektu.

### 2.3 Cache & výkon

Worker odpovídá s `Cache-Control: public, max-age=3600` (1 h). Google Places API má cost ~$17 / 1000 Place Details requestů, takže při 1h cache a běžném provozu ~720 volání/měsíc to vychází zlomek dolaru. Pokud zvýšíte cache na 6 h, klesne to dál.

### 2.4 Kód Workeru

```javascript
// izodiamant-reviews-api – Cloudflare Worker
// Env: FIRMY_PROFILE_URL, GOOGLE_PLACE_ID, GOOGLE_API_KEY

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      ...CORS,
    },
    ...init,
  });

const slug = (t) =>
  String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();

const normalizeDate = (dateStr) => {
  // Firmy.cz uses "D.M.YYYY"
  const parts = String(dateStr || '').split('.').map((p) => p.trim());
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return dateStr;
};

async function fetchFirmy(profileUrl) {
  if (!profileUrl) return { reviews: [], rating: null, count: 0, error: 'FIRMY_PROFILE_URL not set' };
  try {
    const res = await fetch(profileUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'cs-CZ,cs;q=0.9',
      },
    });
    const html = await res.text();
    const blocks = html.split('<div class="item">').slice(1);
    const reviews = [];
    for (const block of blocks) {
      const authorMatch = block.match(/<div class="authorName">\s*<span>([^<]+)<\/span>/);
      const dateMatch = block.match(/<span class="date">([^<]+)<\/span>/);
      const textMatch = block.match(/<div class="text">([\s\S]*?)<\/div>/);
      const ratingMatch = block.match(/title="(\d+) %"/);
      if (authorMatch && textMatch) {
        const author = authorMatch[1].trim();
        const date = dateMatch ? normalizeDate(dateMatch[1].trim()) : '2024-01-01';
        const stars = ratingMatch ? parseInt(ratingMatch[1], 10) / 20 : 5;
        reviews.push({
          id: `firmy-${date}-${slug(author)}`,
          source: 'firmy',
          author,
          text: textMatch[1].trim().replace(/<[^>]*>?/gm, ''),
          date,
          rating: stars,
          sourceUrl: profileUrl.replace(/\?.*$/, ''),
        });
      }
    }
    const statsMatch = html.match(/<div class="badge green">\s*([\d,]+)\s*<\/div>/);
    const countMatch = html.match(/<span class="ratingCount">(\d+)\s*hodnocení<\/span>/);
    return {
      reviews,
      rating: statsMatch ? parseFloat(statsMatch[1].replace(',', '.')) : null,
      count: countMatch ? parseInt(countMatch[1], 10) : reviews.length,
    };
  } catch (e) {
    return { reviews: [], rating: null, count: 0, error: `firmy: ${e.message}` };
  }
}

async function fetchGoogle(placeId, apiKey) {
  if (!placeId || !apiKey) {
    return { reviews: [], rating: null, count: 0, error: 'GOOGLE_PLACE_ID / GOOGLE_API_KEY not set' };
  }
  try {
    // Place Details – returns up to 5 most relevant reviews; ask for Czech translations.
    const fields = 'rating,user_ratings_total,reviews,url';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId,
    )}&fields=${fields}&language=cs&reviews_no_translations=false&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') {
      return { reviews: [], rating: null, count: 0, error: `google: ${data.status}` };
    }
    const place = data.result || {};
    const sourceUrl = place.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    const reviews = (place.reviews || []).map((r) => {
      const d = new Date((r.time || 0) * 1000);
      const date = isNaN(d.getTime()) ? '2024-01-01' : d.toISOString().slice(0, 10);
      return {
        id: `google-${date}-${slug(r.author_name)}`,
        source: 'google',
        author: r.author_name,
        text: (r.text || '').trim(),
        date,
        rating: Number(r.rating) || 5,
        sourceUrl,
        authorUrl: r.author_url || null,
        profilePhoto: r.profile_photo_url || null,
      };
    });
    return {
      reviews,
      rating: typeof place.rating === 'number' ? place.rating : null,
      count: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : reviews.length,
      sourceUrl,
    };
  } catch (e) {
    return { reviews: [], rating: null, count: 0, error: `google: ${e.message}` };
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const [firmy, google] = await Promise.all([
      fetchFirmy(env.FIRMY_PROFILE_URL),
      fetchGoogle(env.GOOGLE_PLACE_ID, env.GOOGLE_API_KEY),
    ]);

    const allReviews = [...firmy.reviews, ...google.reviews].sort((a, b) =>
      b.date.localeCompare(a.date),
    );

    // Weighted aggregate rating (across both sources) if available
    let aggregate = null;
    const weighted = [];
    if (firmy.rating != null && firmy.count) weighted.push([firmy.rating, firmy.count]);
    if (google.rating != null && google.count) weighted.push([google.rating, google.count]);
    if (weighted.length) {
      const totalN = weighted.reduce((a, [, n]) => a + n, 0);
      aggregate = weighted.reduce((a, [r, n]) => a + r * n, 0) / totalN;
    }

    return json({
      rating: aggregate != null ? Math.round(aggregate * 10) / 10 : 5.0,
      count: (firmy.count || 0) + (google.count || 0),
      reviews: allReviews,
      sources: {
        firmy: {
          rating: firmy.rating,
          count: firmy.count,
          error: firmy.error || null,
        },
        google: {
          rating: google.rating,
          count: google.count,
          sourceUrl: google.sourceUrl || null,
          error: google.error || null,
        },
      },
      lastUpdate: new Date().toISOString(),
    });
  },
};
```

### 2.5 Návratová struktura

```json
{
  "rating": 4.9,
  "count": 123,
  "reviews": [
    {
      "id": "google-2025-04-12-jan-novak",
      "source": "google",
      "author": "Jan Novák",
      "text": "Profesionální přístup, vše OK.",
      "date": "2025-04-12",
      "rating": 5,
      "sourceUrl": "https://www.google.com/maps/place/?q=place_id:...",
      "authorUrl": "https://www.google.com/maps/contrib/...",
      "profilePhoto": "https://lh3.googleusercontent.com/..."
    },
    {
      "id": "firmy-2025-03-22-marie-svobodova",
      "source": "firmy",
      "author": "Marie Svobodová",
      "text": "Doporučuji.",
      "date": "2025-03-22",
      "rating": 5,
      "sourceUrl": "https://www.firmy.cz/detail/13505805-..."
    }
  ],
  "sources": {
    "firmy": { "rating": 4.9, "count": 80, "error": null },
    "google": { "rating": 5.0, "count": 43, "sourceUrl": "...", "error": null }
  },
  "lastUpdate": "2026-05-15T08:00:00.000Z"
}
```

### 2.6 Frontend integrace

Frontend (`HomeReviews.tsx`) konzumuje `reviews[]`, řadí podle `date` a renderuje badge podle `source`. Fallback `src/data/reviews.json` musí obsahovat `source` na každé položce (`"firmy"` nebo `"google"`), aby UI fungovalo i bez Workeru.

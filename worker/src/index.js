// izodiamant-reviews-api – Cloudflare Worker
//
// Živé recenze ze Seznam Firmy.cz (HTML widget) a Google Places API,
// sjednocené do jedné struktury s polem `source` ("firmy" | "google").
//
// Konfigurace (Cloudflare vars/secrets, viz worker/wrangler.toml a deployment.MD):
//   FIRMY_PROFILE_URL  – vars   – URL Firmy.cz profilu (?widget&limit=...)
//   GOOGLE_PLACE_ID    – vars   – Place ID (ChIJ...); prázdné = Google se přeskočí
//   GOOGLE_API_KEY     – secret – klíč s povolenou Places API
//
// Tento soubor je jediný zdroj pravdy pro worker. Nasazuje se automaticky
// při změně worker/** (viz .github/workflows/deploy-worker.yml).

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

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { loadPricing, priceRanges } from '@/lib/quotes/pricing';

export const runtime = 'edge';

/**
 * Rozmezí cen služeb (Kč/m² řezné plochy) z ceníku v adminu – pro kalkulačku na
 * webu. Veřejné: vrací jen min/max, ne ceny po krajích ani sazby dopravy.
 * Bez D1 platí výchozí ceník z src/data/pricing.json.
 */
export async function GET() {
  const ranges = priceRanges(await loadPricing(getDB()));
  return NextResponse.json(
    { ranges },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600' } },
  );
}

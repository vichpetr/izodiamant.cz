import calculatorData from '@/data/calculator.json';

/**
 * Sazby v `calculator.json` jsou cenou za **metr čtvereční (m²) řezné plochy** –
 * tedy za plochu, kterou je nutné zdivem prořezat nebo proinjektovat. Kalkulačka
 * ji spočítá jako `délka zdi × (tloušťka / 100)`; konstanta žije tady, aby ji
 * vedle kalkulačky mohla použít i strukturovaná data na stránkách služeb a obě
 * čísla se nemohla rozejít (viz skill site-invariants, pravidlo 1).
 */
export const CM_PER_METER = 100;

/** Řezná plocha v m² pro zeď dané délky (m) a tloušťky (cm). */
export function cutAreaM2(lengthM: number, thicknessCm: number): number {
  return lengthM * (thicknessCm / CM_PER_METER);
}

/**
 * Nejnižší sazba za m² pro danou službu napříč typy zdiva – tedy to „od“, které
 * web uvádí v `services.json`. `null` u služby bez ceníkové sazby (zednické
 * práce jsou cena dohodou a v `calculator.json` schválně nejsou).
 */
export function minPricePerM2(serviceId: string): number | null {
  const rates = calculatorData
    .flatMap((material) => material.availableServices)
    .filter((service) => service.id === serviceId)
    .map((service) => service.minPrice);

  return rates.length > 0 ? Math.min(...rates) : null;
}

/**
 * `offers` do Service JSON-LD s **číselnou** cenou, ne jen s textem. Bez čísla
 * Google cenu z nabídky nepřečte (dřív tu byl jen `description`), takže se
 * nemohla objevit ve výsledku vyhledávání.
 *
 * `minPrice` je správně místo `price`: ceny jsou „od“, konečná se odvíjí od
 * řezné plochy. Firma není plátcem DPH, uvedená částka je konečná.
 */
export function serviceOffer(serviceId: string, priceRangeText: string) {
  const minPrice = minPricePerM2(serviceId);

  const priceSpecification = minPrice
    ? {
        '@type': 'UnitPriceSpecification',
        priceCurrency: 'CZK',
        minPrice,
        unitText: 'm²',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitCode: 'MTK',
          unitText: 'm²',
        },
        description: `${priceRangeText}; sazba platí za m² řezné plochy, tedy délku zdi vynásobenou její tloušťkou.`,
      }
    : { '@type': 'PriceSpecification', description: priceRangeText };

  return {
    '@type': 'Offer',
    priceCurrency: 'CZK',
    availableAtOrFrom: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressCountry: 'CZ' },
    },
    priceSpecification,
  };
}

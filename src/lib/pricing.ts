import calculatorData from '@/data/calculator.json';

/**
 * Sazby v `calculator.json` jsou cenou za **běžný metr (bm)** při této tloušťce
 * zdiva; kalkulačka je škáluje `× (tloušťka / 45) × délka`. Konstanta žije tady,
 * aby ji vedle kalkulačky mohla použít i strukturovaná data na stránkách služeb
 * a obě čísla se nemohla rozejít (viz skill site-invariants, pravidlo 1).
 */
export const REFERENCE_THICKNESS_CM = 45;

/**
 * Nejnižší sazba za bm pro danou službu napříč typy zdiva – tedy to „od“, které
 * web uvádí v `services.json`. `null` u služby bez ceníkové sazby (zednické
 * práce jsou cena dohodou a v `calculator.json` schválně nejsou).
 */
export function minPricePerBm(serviceId: string): number | null {
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
 * tloušťky zdiva. Firma není plátcem DPH, uvedená částka je konečná.
 */
export function serviceOffer(serviceId: string, priceRangeText: string) {
  const minPrice = minPricePerBm(serviceId);

  const priceSpecification = minPrice
    ? {
        '@type': 'UnitPriceSpecification',
        priceCurrency: 'CZK',
        minPrice,
        unitText: 'bm',
        referenceQuantity: {
          '@type': 'QuantitativeValue',
          value: 1,
          unitCode: 'MTR',
          unitText: 'bm',
        },
        description: `${priceRangeText}; sazba platí při tloušťce zdiva ${REFERENCE_THICKNESS_CM} cm, u silnějšího zdiva se cena úměrně navyšuje.`,
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

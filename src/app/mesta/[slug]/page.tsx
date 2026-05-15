import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import mestaData from "@/data/mesta.json";

type Mesto = {
  id: string;
  name: string;
  slug: string;
  keywords: string[];
  description: string;
  lat: number;
  lng: number;
  telephone: string;
  relatedIds: string[];
  intro: string;
  services: string;
  benefits: string;
};

const SITE_URL = "https://izodiamant.cz";

export async function generateStaticParams() {
  return (mestaData as Mesto[]).map((mesto) => ({
    slug: mesto.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mesto = (mestaData as Mesto[]).find((m) => m.slug === slug);
  if (!mesto) return { title: "Město nenalezeno" };

  return {
    title: `Sanace zdiva ${mesto.name} | IZODIAMANT`,
    description: mesto.description,
    keywords: [
      ...mesto.keywords,
      "sanace zdiva",
      "podřezávání zdiva",
      "diamantové lano",
      "řetězová pila",
      "chemická injektáž",
      "odvlhčení zdiva",
      "hydroizolace",
      "IZODIAMANT",
    ],
    alternates: {
      canonical: `${SITE_URL}/mesta/${mesto.slug}`,
    },
    openGraph: {
      type: "website",
      locale: "cs_CZ",
      url: `${SITE_URL}/mesta/${mesto.slug}`,
      siteName: "IZODIAMANT",
      title: `Sanace zdiva ${mesto.name} | IZODIAMANT`,
      description: mesto.description,
      images: [{ url: "/logo.png", width: 800, height: 600, alt: `IZODIAMANT – sanace zdiva ${mesto.name}` }],
    },
  };
}

export default async function MestoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mesto = (mestaData as Mesto[]).find((m) => m.slug === slug);
  if (!mesto) {
    return (
      <main className="min-h-screen bg-neutral-light">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-black text-neutral-dark mb-4">Město nenalezeno</h1>
          <Link href="/" className="text-primary hover:underline">Zpět na hlavní stranu</Link>
        </div>
        <Footer />
      </main>
    );
  }

  const benefitItems = mesto.benefits
    .replace(/^Proč zvolit naši službu[^:]*:\s*/i, "")
    .split(/,\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-neutral-light to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[1.1] mb-6">
              Sanace zdiva <span className="text-primary">{mesto.name}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
              {mesto.intro}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/#calculator"
                className="group btn-primary py-4 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
              >
                Nezávazná kalkulace
                <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href={`tel:${mesto.telephone.replace(/\s+/g, "")}`}
                className="btn-outline py-4 px-10 text-lg uppercase tracking-widest flex items-center justify-center gap-3 border-neutral-dark/20 text-neutral-dark hover:bg-neutral-dark hover:text-white"
              >
                <Icons.Phone className="w-5 h-5 text-primary" />
                {mesto.telephone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-8 text-center">
              Trápí vás vlhké zdivo, plísně<br />nebo vzlínající vlhkost v{" "}
              <span className="text-primary">{mesto.name}</span>?
            </h2>
            <p className="text-lg text-neutral-dark/70 font-medium leading-relaxed mb-12 text-center">
              Vlhkost zdiva je vážný problém, který se neodstraní sám. Vzlínající vlhkost ničí omítky, způsobuje plísně a zhoršuje tepelnou izolaci vašeho domu. Nabízíme trvalé řešení.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Icons.Droplet,
                title: "Vzlínající vlhkost zdiva",
                text: "Voda kapí zdí a vytváří nevzhledné vlhké mapy. Bez zásahu se problém neustále zhoršuje a postupně ničí stavbu.",
              },
              {
                icon: Icons.Mold,
                title: "Plísně a škůdci",
                text: "Vlhké prostředí je ideální pro růst plísní, které škodí nejen stavbě, ale i zdraví vaší rodiny.",
              },
              {
                icon: Icons.Thermometer,
                title: "Ztráta tepla",
                text: "Mokré zdivo má až 5× horší tepelnou vodivost než suché. Výrazně navyšuje vaše náklady na vytápění.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-neutral-light p-8 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                  <item.icon className="w-6 h-6 text-primary group-hover:text-neutral-dark" />
                </div>
                <h3 className="text-xl font-black text-neutral-dark uppercase mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-neutral-dark/60 font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-primary/5 rounded-3xl p-8 md:p-12 border-2 border-primary/10">
            <h3 className="text-2xl font-black text-neutral-dark uppercase italic mb-4">
              Jak problém s vlhkostí zdiva řešit v{" "}
              <span className="text-primary">{mesto.name}</span>?
            </h3>
            <p className="text-neutral-dark/70 font-medium leading-relaxed mb-6">
              {mesto.services}
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
                <h4 className="font-black text-primary uppercase text-sm tracking-widest mb-2">Diamantové lano</h4>
                <p className="text-sm text-neutral-dark/60 leading-relaxed">Pro kámen, beton a smíšené zdivo. Milimetrová přesnost bez otřesů.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
                <h4 className="font-black text-primary uppercase text-sm tracking-widest mb-2">Řetězová pila</h4>
                <p className="text-sm text-neutral-dark/60 leading-relaxed">Nejrychlejší metoda pro cihelné zdivo. Okamžité vložení hydroizolace.</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
                <h4 className="font-black text-primary uppercase text-sm tracking-widest mb-2">Chemická injektáž</h4>
                <p className="text-sm text-neutral-dark/60 leading-relaxed">Bezhlučný proces pro lokální problémy. Vodoodpudivá bariéra uvnitř zdiva.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-neutral-light" id="kalkulace">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-4">
              Kolik stojí sanace zdiva v <span className="text-primary">{mesto.name}</span>?
            </h2>
            <p className="text-lg text-neutral-dark/60 font-medium max-w-2xl mx-auto">
              Cena závisí na typu zdiva, tloušťce a zvolené technologii. Pomocí naší kalkulačky si můžete nechat spočítat orientační cenu ještě před kontaktem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Link
              href="/sluzby/diamantove-lano"
              className="bg-white p-8 rounded-2xl border-2 border-neutral-light/50 hover:border-primary transition-all shadow-sm group"
            >
              <Icons.Gem className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-black text-xl text-neutral-dark uppercase mb-2">Diamantové lano</h3>
              <p className="text-neutral-dark/60 font-medium text-sm mb-4 leading-relaxed">
                Od 4 500 Kč/m². Pro kamenné, betonové a smíšené zdivo.
              </p>
              <span className="text-primary font-black text-sm uppercase tracking-widest group-hover:underline inline-flex items-center gap-1">
                Více info <Icons.ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/sluzby/retezova-pila"
              className="bg-white p-8 rounded-2xl border-2 border-neutral-light/50 hover:border-primary transition-all shadow-sm group"
            >
              <Icons.Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-black text-xl text-neutral-dark uppercase mb-2">Řetězová pila</h3>
              <p className="text-neutral-dark/60 font-medium text-sm mb-4 leading-relaxed">
                Od 2 500 Kč/m². Nejrychlejší pro cihelné zdivo.
              </p>
              <span className="text-primary font-black text-sm uppercase tracking-widest group-hover:underline inline-flex items-center gap-1">
                Více info <Icons.ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/sluzby/chemicka-injektaz"
              className="bg-white p-8 rounded-2xl border-2 border-neutral-light/50 hover:border-primary transition-all shadow-sm group"
            >
              <Icons.ShieldCheck className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-black text-xl text-neutral-dark uppercase mb-2">Chemická injektáž</h3>
              <p className="text-neutral-dark/60 font-medium text-sm mb-4 leading-relaxed">
                Od 2 500 Kč/bm. Bezhlučná a šetrná metoda.
              </p>
              <span className="text-primary font-black text-sm uppercase tracking-widest group-hover:underline inline-flex items-center gap-1">
                Více info <Icons.ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <div className="text-center">
            <Link
              href="/#calculator"
              className="btn-primary py-4 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center gap-3"
            >
              Spočítat cenu – Kalkulačka
              <Icons.Calculator className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-12 text-center">
            Proč zvolit IZODIAMANT v <span className="text-primary">{mesto.name}</span>?
          </h2>

          {benefitItems.length > 0 && (
            <ul className="max-w-3xl mx-auto mb-12 grid sm:grid-cols-2 gap-3">
              {benefitItems.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-neutral-dark/80 font-medium">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span>{b.charAt(0).toUpperCase() + b.slice(1)}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-dark uppercase text-lg mb-1">Lokální přítomnost v {mesto.name}</h3>
                  <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">
                    Nacházíme se blízko vás. Díky místní přítomnosti jsme schopni rychleji reagovat na vaše požadavky a nabídnout rychlé termíny realizace.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.Clock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-dark uppercase text-lg mb-1">Rychlá realizace</h3>
                  <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">
                    Každý projekt realizujeme v co nejkratším termínu. Díky vlastnímu strojovému parku a zkušeným technikům zvládneme i náročné zakázky rychle.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.Coins className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-dark uppercase text-lg mb-1">Transparentní ceny bez skrytých poplatků v {mesto.name}</h3>
                  <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">
                    Naše kalkulačka vám ukáže orientační cenu ještě před spuštěním strojů. Cena za metr podřezání zdiva je vždy konečná a jasná.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-dark uppercase text-lg mb-1">Záruka na všechny práce</h3>
                  <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">
                    Naše sanace zdiva v {mesto.name} je zakončena prodlouženou zárukou. Používáme pouze certifikované izolační materiály s ověřenou životností.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.Calculator className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-dark uppercase text-lg mb-1">Unikátní kalkulačka ceny</h3>
                  <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">
                    Naše kalkulačka vám umožní spočítat si cenu sanace ještě před kontaktem. Konkurence nabízí pouze kontaktní formuláře – my vám dáváme okamžitou orientaci.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icons.ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-neutral-dark uppercase text-lg mb-1">100% suchý dům – garantováno</h3>
                  <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">
                    Vracíme zdraví vaší stavbě. Díky moderním technologiím – diamantovému lanu, řetězové pile a chemické injektáži – je vaše domov navždy chráněn před vlhkostí.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured data: Service + Breadcrumbs (LocalBusiness with real address lives in root layout) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                "@id": `${SITE_URL}/mesta/${mesto.slug}#service`,
                "serviceType": "Sanace a podřezávání vlhkého zdiva",
                "name": `Sanace zdiva ${mesto.name}`,
                "description": mesto.description,
                "url": `${SITE_URL}/mesta/${mesto.slug}`,
                "provider": {
                  "@type": "LocalBusiness",
                  "name": "IZODIAMANT",
                  "url": SITE_URL,
                  "telephone": mesto.telephone,
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Mokrá Lhota 26",
                    "addressLocality": "Nové Hrady",
                    "postalCode": "53944",
                    "addressCountry": "CZ",
                  },
                },
                "areaServed": {
                  "@type": "City",
                  "name": mesto.name,
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": mesto.lat,
                    "longitude": mesto.lng,
                  },
                },
              },
              {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  { "@type": "ListItem", "position": 1, "name": "Úvod", "item": SITE_URL },
                  { "@type": "ListItem", "position": 2, "name": "Města", "item": `${SITE_URL}/mesta` },
                  { "@type": "ListItem", "position": 3, "name": mesto.name, "item": `${SITE_URL}/mesta/${mesto.slug}` },
                ],
              },
            ],
          }),
        }}
      />

      <Footer />
    </main>
  );
}

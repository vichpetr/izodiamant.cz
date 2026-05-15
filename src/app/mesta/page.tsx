import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import mestaData from "@/data/mesta.json";

export const metadata: Metadata = {
  title: "Sanace zdiva – města a oblasti | IZODIAMANT",
  description: "Přehled měst, kde poskytujeme sanace vlhkého zdiva, podřezávání a chemickou injektáž. Vracíme zdraví vaší stavbě.",
  alternates: { canonical: "https://izodiamant.cz/mesta" },
};

const HQ_PHONE = "+420737017012";

type Mesto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  lat: number;
  lng: number;
};

export default function MestaPage() {
  const mesta = mestaData as Mesto[];

  return (
    <main className="min-h-screen bg-neutral-light">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Sanace zdiva podle měst",
            "description": "Přehled měst a oblastí, kde IZODIAMANT poskytuje služby sanace a podřezávání zdiva.",
            "url": "https://izodiamant.cz/mesta",
            "mainEntity": mesta.map((m) => ({
              "@type": "City",
              "name": m.name,
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": m.lat,
                "longitude": m.lng,
              },
            })),
          }),
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-6">
            Naše služby podle <span className="text-primary">měst</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-neutral-dark/60 font-medium leading-relaxed">
            Zabýváme se sanací vlhkého zdiva, podřezáváním a izolací po celé České republice. Vyberte si vaše město a zjistěte, jak vám můžeme pomoci s odstraněním vlhkosti, plísní a vzlínající vlhkosti zdiva.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mesta.map((mesto) => (
            <Link
              key={mesto.id}
              href={`/mesta/${mesto.slug}`}
              className="bg-white rounded-2xl border-2 border-neutral-light/50 p-6 hover:border-primary transition-all shadow-sm hover:shadow-md group"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-black text-neutral-dark uppercase text-lg group-hover:text-primary transition-colors">
                  {mesto.name}
                </h3>
                <Icons.ArrowUpRight className="w-5 h-5 text-primary/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-neutral-dark/60 text-sm font-medium leading-relaxed">
                {mesto.description}
              </p>
              <span className="text-primary font-black text-xs uppercase tracking-widest mt-4 inline-flex items-center gap-1 group-hover:underline">
                Zobrazit služby <Icons.ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 rounded-3xl p-8 md:p-12 border-2 border-primary/10 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-dark uppercase italic mb-4">
            Nemůžete najít vaše město?
          </h2>
          <p className="text-neutral-dark/60 font-medium mb-6 max-w-xl mx-auto">
            IZODIAMANT působí po celé České republice. Pokud vaše město nebo oblast není v seznamu, neváhejte nás kontaktovat – rádi vám připravíme individuální nabídku na sanace vlhkého zdiva.
          </p>
          <a
            href={`tel:${HQ_PHONE}`}
            className="btn-primary py-4 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center justify-center gap-3"
          >
            Zavolat nám
            <Icons.Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    </main>
  );
}
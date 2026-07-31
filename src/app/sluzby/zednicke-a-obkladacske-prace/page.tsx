import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import servicesData from "@/data/services.json";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/sluzby/zednicke-a-obkladacske-prace',
    title: "Zednické a obkladačské práce",
    description: "Zednické a obkladačské práce – zdění, omítky, štuky, betonáž, výkopy, obklady a dlažby. Působíme do cca 60 km od Nových Hradů. Cena dohodou, nezávazná poptávka online.",
    images: ['/og-zednicke.jpg'],
  }),
  keywords: ["zednické práce", "obkladačské práce", "zdění", "omítky", "štuky", "betonáž", "výkopové práce", "obklady a dlažba", "zedník", "Nové Hrady", "Pardubicko"],
};

export default function MasonryPage() {
  const data = servicesData["zednicke-a-obkladacske-prace"];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Zednické a obkladačské práce",
    "provider": { "@type": "LocalBusiness", "name": "IZODIAMANT" },
    "description": "Zednické a obkladačské práce – zdění, omítky, štuky, betonáž, výkopy a pokládka obkladů a dlažby.",
    "areaServed": { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates", "latitude": "49.8517231", "longitude": "16.1432100" }, "geoRadius": "60000" },
    "offers": {
      "@type": "Offer",
      "priceSpecification": { "@type": "PriceSpecification", "description": "Cena dohodou podle rozsahu prací" }
    }
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Domů", path: "/" },
    { name: "Služby", path: "/#sluzby" },
    { name: "Zednické a obkladačské práce", path: "/sluzby/zednicke-a-obkladacske-prace" },
  ]);

  // Přehled činností.
  const works = [
    { title: "Zdění", desc: "Vyzdívky, dozdívky a úpravy zdiva z cihel i tvárnic." },
    { title: "Omítky a štuky", desc: "Jádrové i štukové omítky, opravy a začišťování povrchů." },
    { title: "Betonáž", desc: "Základy, podkladní desky, dobetonávky a menší konstrukce." },
    { title: "Výkopové práce", desc: "Výkopy pro základy, drenáže a přípojky." },
    { title: "Obklady a dlažby", desc: "Lepení a spárování obkladů a dlažeb v interiéru i exteriéru." },
    { title: "Dokončovací práce", desc: "Navazující drobné zednické a dokončovací činnosti." },
  ];

  return (
    <main className="min-h-screen bg-neutral-light">
      {/* JSON-LD renderujeme jako běžný <script>, aby byl v serverovém HTML i pro crawlery bez JS. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />

      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary-ink font-black text-xs uppercase tracking-widest mb-6">
              <Icons.Construction className="w-4 h-4" />
              Doplňková služba
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
              Zednické a <br /><span className="text-primary-ink">obkladačské práce</span>
            </h1>
            <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-8">
              Kromě sanace vlhkého zdiva zajišťujeme i běžné zednické a obkladačské práce – zdění, omítky a štuky,
              betonáž, výkopy i pokládku obkladů a dlažby. Ať už jde o menší opravu, nebo navazující práce po
              sanaci, domluvíme se na konkrétním řešení i ceně.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                Nezávazná poptávka
              </Link>
              <a href="tel:+420737017012" className="inline-flex items-center gap-2 py-4 px-8 rounded-xl border-2 border-neutral-dark/10 font-black uppercase tracking-widest text-sm text-neutral-dark hover:border-primary/40 transition-colors">
                <Icons.Phone className="w-4 h-4 text-primary" /> +420 737 017 012
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {works.map((w, i) => (
              <div key={i} className="bg-white p-7 rounded-3xl shadow-sm border border-neutral-dark/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary-ink flex items-center justify-center mb-5"><Icons.CheckCircle2 className="w-6 h-6" /></div>
                <h2 className="text-lg font-black text-neutral-dark uppercase italic mb-2">{w.title}</h2>
                <p className="text-neutral-dark/70 font-medium text-sm leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>

          {/* Cena + působnost */}
          <div className="grid lg:grid-cols-2 gap-6 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Icons.Coins className="w-10 h-10 text-primary mb-5" />
              <h2 className="text-xl font-black text-neutral-dark uppercase mb-2">Cena</h2>
              <p className="text-neutral-dark/70 font-medium leading-relaxed">
                {data.priceRange}. Rozsah a náročnost prací se případ od případu liší, proto cenu stanovíme
                individuálně po upřesnění zadání, případně po prohlídce. Pošlete nezávaznou poptávku a ozveme se.
              </p>
            </div>
            <div className="bg-neutral-dark text-white p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -rotate-12 translate-x-10 -translate-y-10" />
              <Icons.MapPin className="w-10 h-10 text-primary mb-5 relative z-10" />
              <h2 className="text-xl font-black uppercase mb-2 relative z-10">Kde pracujeme</h2>
              <p className="text-white/70 font-medium leading-relaxed relative z-10">
                Zednické a obkladačské práce provádíme <strong className="text-white">do cca 60 km od Nových Hradů</strong>
                {" "}(Pardubicko a okolí). Sanaci vlhkého zdiva naopak realizujeme po celé ČR.
              </p>
            </div>
          </div>

          {/* Jak to funguje */}
          <div className="bg-white rounded-[3rem] p-8 md:p-14 border border-neutral-dark/5 shadow-sm">
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-10">Jak to funguje</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Nezávazná poptávka", desc: "Napíšete, o jaké práce jde, kde a přibližně kdy. Stačí pár vět." },
                { step: "02", title: "Domluva a cena", desc: "Ozveme se, upřesníme rozsah a domluvíme cenu; u větších prací po prohlídce." },
                { step: "03", title: "Realizace", desc: "Práce provedeme v dohodnutém termínu a kvalitě." },
              ].map((s, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="text-4xl font-black text-primary-ink/70 italic shrink-0 leading-none">{s.step}</div>
                  <div>
                    <div className="text-lg font-black uppercase italic text-neutral-dark mb-1">{s.title}</div>
                    <p className="text-neutral-dark/70 font-medium text-sm">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center gap-3">
                Poslat nezávaznou poptávku <Icons.Send className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-neutral-dark/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark mb-8 text-center">Naše hlavní specializace</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/sluzby/diamantove-lano" className="group flex items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all">
              <span className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors">Diamantové lano</span>
              <Icons.ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/sluzby/retezova-pila" className="group flex items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all">
              <span className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors">Řetězová pila</span>
              <Icons.ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/sluzby/chemicka-injektaz" className="group flex items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all">
              <span className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors">Chemická injektáž</span>
              <Icons.ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

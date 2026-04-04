import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import servicesData from "@/data/services.json";

export const metadata: Metadata = {
  title: "Podřezávání zdiva řetězovou pilou | IZODIAMANT",
  description: "Rychlé a efektivní podřezávání cihelného zdiva řetězovou pilou. Trvalé odstranění vzlínající vlhkosti s dlouholetou zárukou.",
  keywords: ["řetězová pila", "podřezávání cihelného zdiva", "sanace vlhkého zdiva", "izolace proti vlhkosti", "Nové Hrady", "ČR"],
};

export default function ChainSawPage() {
  const data = servicesData["retezova-pila"];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Podřezávání zdiva řetězovou pilou",
    "provider": {
      "@type": "LocalBusiness",
      "name": "IZODIAMANT"
    },
    "description": "Osvědčená mechanická metoda izolace vlhkého zdiva, určená primárně pro cihlové stavby s průběžnou spárou.",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "description": data.priceRange
      }
    }
  };

  const features = [
    "Nejrychlejší metoda pro cihelné zdivo",
    "Okamžité vložení hydroizolace",
    "Zlepšení tepelných vlastností objektu",
    "Statické zajištění pomocí klínů",
    "Minimální zásah do chodu domácnosti",
    "Vysoká efektivita a příznivá cena"
  ];

  return (
    <main className="min-h-screen bg-neutral-light">
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} strategy="afterInteractive" />
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest mb-6">
                <Icons.Zap className="w-4 h-4" />
                Rychlost a efektivita
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Podřezávání <br /><span className="text-primary">řetězovou pilou</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Osvědčená mechanická metoda izolace vlhkého zdiva, určená primárně pro cihlové stavby s průběžnou spárou. Tato technologie umožňuje rychlé a definitivní odstranění vzlínající vlhkosti vložením nové hydroizolace přímo do konstrukce domu.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Nezávazná kalkulace pro cihlu
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/sluzby/retezova-pila.jpg"
                alt="Podřezávání zdiva řetězovou pilou"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Icons.Coins className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Cena</h3>
              <p className="text-neutral-dark/60 font-medium">{data.priceRange}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Icons.Clock className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Rychlost</h3>
              <p className="text-neutral-dark/60 font-medium">{data.duration}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Icons.ShieldCheck className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Záruka</h3>
              <p className="text-neutral-dark/60 font-medium">Používáme vysoce kvalitní PE folie s životností přesahující 50 let.</p>
            </div>
          </div>

          <div className="bg-neutral-dark rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-20" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl font-black uppercase italic mb-8">Technický postup</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">1</div>
                    <p className="text-white/70 font-medium">Příprava pracovního prostoru a vyklizení okolí zdí.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">2</div>
                    <p className="text-white/70 font-medium">Postupné prořezávání ložné spáry cihelného zdiva speciální pilou.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">3</div>
                    <p className="text-white/70 font-medium">Čištění spáry a vložení hydroizolační fólie (PE o tloušťce 2 mm).</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">4</div>
                    <p className="text-white/70 font-medium">Statické zajištění zdiva pomocí plastových statických klínů.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">5</div>
                    <p className="text-white/70 font-medium">Tlakové vyplnění zbylé spáry cementovou suspenzí.</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic mb-8">Hlavní výhody</h2>
                <ul className="space-y-4">
                  {features.map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-white/80 font-bold uppercase text-sm">
                      <Icons.CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="flex items-center gap-2 font-black uppercase text-xs mb-4 text-primary italic">
                    <Icons.Construction className="w-4 h-4" />
                    Vhodné materiály
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Tato metoda je optimalizována pro cihlové zdivo s průběžnou vodorovnou spárou. U kamenného zdiva doporučujeme technologii diamantového lana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

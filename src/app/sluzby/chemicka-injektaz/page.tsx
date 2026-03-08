import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, CheckCircle2, Clock, Coins, Construction } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import servicesData from "@/data/services.json";

export const metadata: Metadata = {
  title: "Chemická injektáž vlhkého zdiva | IZODIAMANT",
  description: "Moderní a šetrná metoda vytvoření dodatečné hydroizolace pomocí chemické injektáže. Certifikované gely, rychlá aplikace bez narušení statiky.",
  keywords: ["chemická injektáž", "injektáž zdiva", "sanace vlhkosti", "hydrofobní gel", "odvlhčení", "Nové Hrady", "ČR"],
};

export default function ChemicalInjectionPage() {
  const data = servicesData["chemicka-injektaz"];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Chemická injektáž zdiva",
    "provider": {
      "@type": "LocalBusiness",
      "name": "IZODIAMANT"
    },
    "description": "Moderní a vysoce účinná metoda vytvoření dodatečné hydroizolační clony. Ideální pro objekty, kde nelze mechanicky řezat.",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "description": data.priceRange
      }
    }
  };

  const features = [
    "Vhodné tam, kde nelze mechanicky řezat",
    "Minimální zásah do konstrukce zdiva",
    "Čistý a rychlý proces bez vibrací",
    "Vysoká účinnost proti vzlínající vlhkosti",
    "Možnost realizace z interiéru i exteriéru",
    "Certifikované sanační gely a krémy"
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
                <ShieldCheck className="w-4 h-4" />
                Šetrné řešení
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Chemická <br /><span className="text-primary">injektáž zdiva</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Moderní a vysoce účinná metoda vytvoření dodatečné hydroizolační clony. Tato technologie je ideální pro objekty, kde statické nebo technické důvody neumožňují mechanické podřezání. Speciální gely pronikají do struktury zdiva a vytvářejí trvalou bariéru proti vlhkosti.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Poptat injektáž
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('/images/sluzby/chemicka-injektaz.jpg')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Coins className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Cena</h3>
              <p className="text-neutral-dark/60 font-medium">{data.priceRange}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Clock className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Rychlost</h3>
              <p className="text-neutral-dark/60 font-medium">{data.duration}</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <ShieldCheck className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Záruka</h3>
              <p className="text-neutral-dark/60 font-medium">Používáme špičkové certifikované materiály s dlouholetou životností.</p>
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
                    <p className="text-white/70 font-medium">Očištění zdiva a vyvrtání injektážních otvorů v předepsaných rozestupech.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">2</div>
                    <p className="text-white/70 font-medium">Vyčištění vyvrtaných otvorů stlačeným vzduchem pro lepší přilnavost směsi.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">3</div>
                    <p className="text-white/70 font-medium">Osazení injektážních pakrů (ventilů) nebo přímé plnění krémovou směsí.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">4</div>
                    <p className="text-white/70 font-medium">Tlaková nebo beztlaková aplikace hydroizolační látky do zdiva.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">5</div>
                    <p className="text-white/70 font-medium">Zatěsnění otvorů speciální maltou a finální úprava povrchu.</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic mb-8">Hlavní výhody</h2>
                <ul className="space-y-4">
                  {features.map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-white/80 font-bold uppercase text-sm">
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="flex items-center gap-2 font-black uppercase text-xs mb-4 text-primary italic">
                    <Construction className="w-4 h-4" />
                    Kdy zvolit injektáž
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Ideální pro případy, kdy je zdivo špatně přístupné, má nepravidelnou spáru nebo by mechanický zásah mohl ohrozit statiku historického objektu.
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

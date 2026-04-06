import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import servicesData from "@/data/services.json";
import referencesData from '@/data/references.json';

export const metadata: Metadata = {
  title: "Chemická injektáž vlhkého zdiva",
  description: "Dodatečná hydroizolace pomocí chemické injektáže. Šetrná metoda pro trvalé sucho bez narušení statiky zdiva. Vracíme zdraví vaší stavbě.",
  keywords: ["chemická injektáž", "injektáž zdiva", "sanace vlhkosti", "hydrofobní gel", "odvlhčení", "Nové Hrady", "ČR"],
  alternates: {
    canonical: 'https://izodiamant.cz/sluzby/chemicka-injektaz',
  },
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
                <Icons.ShieldCheck className="w-4 h-4" />
                Šetrné řešení
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Chemická <br /><span className="text-primary">injektáž zdiva</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Profesionální <strong>chemická injektáž zdiva</strong> je moderní a vysoce účinná metoda vytvoření dodatečné hydroizolační clony. Tato technologie je ideální pro objekty, kde statické nebo technické důvody neumožňují mechanické podřezání. Speciální gely pronikají hluboko do struktury zdiva a vytvářejí trvalou bariéru proti vlhkosti.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Poptat injektáž
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/sluzby/chemicka-injektaz.jpg"
                alt="Chemická injektáž zdiva - šetrná sanace vlhkosti"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-20 text-neutral-dark/80">
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-6">Jak funguje chemická injektáž?</h2>
            <p>
              Při realizaci <strong>chemické injektáže zdiva</strong> postupujeme vyvrtáním sítě otvorů do zasažených stěn v přesně definovaných rozestupech. Do těchto otvorů následně pod nízkým tlakem nebo infuzně vpravujeme certifikované hydroizolační krémy či gely na silan-siloxanové bázi. Tyto látky mají vynikající schopnost šířit se v pórech materiálu a po vytvrdnutí vytvoří nepropustnou hydrofobní clonu, která okamžitě zastaví vzlínající vlhkost.
            </p>
            <p>
              Tento postup je velmi šetrný ke stavbě, neboť nevyžaduje žádné rozsáhlé výkopové práce ani mechanické prořezávání. Je proto ideální volbou pro vnitřní příčky, sklepy nebo historické objekty se složitou strukturou základů. Naším cílem je dlouhodobý výsledek, kterým vracíme zdraví vaší stavbě.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase italic text-neutral-dark">Průběh chemické injektáže</h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Příprava a vrtání", desc: "Vyvrtání otvorů o průměru 12–14 mm v osových vzdálenostech dle typu zdiva." },
                  { step: "02", title: "Čištění otvorů", desc: "Odstranění vrtné drti pomocí stlačeného vzduchu pro maximální absorpci gelu." },
                  { step: "03", title: "Aplikace injektáže", desc: "Tlakové nebo beztlakové plnění otvorů hydroizolačním gelem/krémem." },
                  { step: "04", title: "Zapravení a kontrola", desc: "Uzavření otvorů sanační maltou a kontrola nasycení okolního zdiva." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="text-4xl font-black text-primary/20 italic italic shrink-0 leading-none">{s.step}</div>
                    <div>
                      <div className="text-lg font-black uppercase italic text-neutral-dark mb-1">{s.title}</div>
                      <p className="text-neutral-dark/60 font-medium">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-neutral-dark text-white p-10 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -rotate-12 translate-x-10 -translate-y-10" />
              <h3 className="text-2xl font-black uppercase italic mb-6 relative z-10">Kdy zvolit chemickou metodu?</h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Místa s omezeným přístupem pro těžkou techniku</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Vnitřní příčky a členité detaily zdiva</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Objekty s velmi narušenou statikou</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Doplňková izolace k mechanickému podřezání</span>
                </li>
              </ul>
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
                      <Icons.CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="flex items-center gap-2 font-black uppercase text-xs mb-4 text-primary italic">
                    <Icons.Construction className="w-4 h-4" />
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

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none text-neutral-dark/80">
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-8">Moderní a šetrná metoda: Chemická injektáž zdiva</h2>
            <p className="mb-6 leading-relaxed">
              Chemická injektáž představuje vysoce efektivní a minimálně invazivní způsob, jak vytvořit dodatečnou hydroizolaci v místech, kde <strong>nelze použít mechanické podřezání</strong>. Tato technologie je ideální pro objekty se špatně přístupným zdivem, nepravidelnou spárou nebo pro historické stavby, kde je prioritou maximální ochrana statiky bez jakýchkoliv vibrací.
            </p>
            <p className="mb-6 leading-relaxed">
              Principem metody je nasycení struktury zdiva speciální hydrofobní látkou (krémem nebo gelem) na bázi silanů a siloxanů. Tato látka proniká i do těch nejmenších pórů a kapilár, kde po vytvrdnutí vytvoří <strong>neprostupnou vodoodpudivou clonu</strong>. Voda tak ztrácí schopnost vzlínat vzhůru a zdivo nad injektážní linií začíná postupně vysychat.
            </p>
            
            <h3 className="text-2xl font-black uppercase italic text-neutral-dark mt-12 mb-6">Proč zvolit injektáž jako řešení vlhkosti?</h3>
            <p className="mb-6 leading-relaxed">
              Jednou z největších výhod chemické injektáže je její <strong>univerzálnost a čistota provedení</strong>. Realizace může probíhat jak z exteriéru, tak z interiéru, což oceníte zejména u řadových domů nebo sklepních prostor. Injektáž nevyžaduje žádné těžké stroje a zásah do konstrukce domu se omezuje pouze na sérii malých navrtaných otvorů, které se po skončení prací odborně zapraví.
            </p>
            <p className="mb-10 leading-relaxed">
              V IZODIAMANT používáme výhradně certifikované materiály s garantovanou účinností. Správně provedená injektáž zajistí vašemu domu <strong>suché zdi na desítky let</strong>, zlepší tepelný odpor zdiva a navrátí do vašich prostor zdravé bydlení bez plísní.
            </p>

            <div className="bg-neutral-light p-10 rounded-3xl border-2 border-primary/20">
              <h4 className="text-xl font-black uppercase italic text-neutral-dark mb-4">Hlavní přednosti chemické injektáže:</h4>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Možnost aplikace u smíšeného, kamenného i velmi silného zdiva.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Absolutně bez otřesů – nejšetrnější metoda k statice budovy.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Rychlá realizace bez nutnosti vyklízení celého patra.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Vysoce efektivní i u zdiva s vysokým stupněm vlhkosti.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-black uppercase italic mb-2">Nedávné realizace</h2>
            <p className="text-neutral-dark/60 font-medium">Prohlédněte si naše projekty, kde jsme využili chemickou injektáž.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {servicesData["chemicka-injektaz"].relatedIds?.map(id => {
              const project = referencesData.find(p => p.id === id);
              if (!project) return null;
              return (
                <Link key={id} href={`/reference/${id}`} className="group bg-white rounded-2xl overflow-hidden border border-neutral-dark/5 shadow-sm hover:shadow-xl transition-all">
                  <div className="relative aspect-video">
                    <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-black uppercase italic text-sm mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-dark/40 font-bold uppercase">
                      <Icons.MapPin className="w-3 h-3 text-primary" />
                      {project.location}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/#reference" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-neutral-dark transition-colors group">
              Všechny reference
              <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}

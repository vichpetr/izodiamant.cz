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
  title: "Podřezávání zdiva řetězovou pilou",
  description: "Sanace zdiva řetězovou pilou. Ideální pro cihelné stavby – rychlý postup a okamžité vložení hydroizolace. Vracíme zdraví vaší stavbě.",
  keywords: ["řetězová pila", "podřezávání cihelného zdiva", "podřezání zdiva řetězovou pilou", "sanace vlhkého zdiva", "izolace proti vlhkosti", "podřezání domu cena", "Nové Hrady", "ČR"],
  alternates: {
    canonical: 'https://izodiamant.cz/sluzby/retezova-pila',
  },
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
    "description": "Rychlá a efektivní metoda izolace vlhkého cihelného zdiva s vložením nové hydroizolační folie.",
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
    "Okamžité vložení 2mm PE hydroizolace",
    "Statické zajištění pomocí plastových klínů",
    "Vysoká životnost přesahující 50 let",
    "Cenově nejvýhodnější mechanická sanace",
    "Vracíme zdraví vaší stavbě."
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
                Rychlá realizace
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Podřezávání <br /><span className="text-primary">řetězovou pilou</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Strojní podřezávání zdiva řetězovou pilou je osvědčená mechanická metoda izolace vlhkého zdiva, určená primárně pro cihlové stavby s průběžnou spárou. Tato technologie umožňuje rychlé a definitivní odstranění vzlínající vlhkosti vložením nové hydroizolace přímo do konstrukce vašeho domu.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Nezávazná kalkulace
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/sluzby/retezova-pila.jpg"
                alt="Podřezávání zdiva řetězovou pilou - efektivní sanace"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-20 text-neutral-dark/80">
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-6">Proč zvolit řetězovou pilu pro sanaci zdiva?</h2>
            <p>
              Technologie podřezávání řetězovou pilou patří mezi nejvyhledávanější metody sanace díky svému vynikajícímu poměru cena/výkon. Používáme profesionální pily s tvrdokovovými řetězy, které plynule proříznou cihelné zdivo v ložné spáře. Tento postup je extrémně rychlý – u běžného rodinného domu jsme schopni dokončit izolaci obvodových zdí během několika málo dnů.
            </p>
            <p>
              Tým IZODIAMANT klade důraz na preciznost a čistotu provedení. Při práci dbáme na to, aby byl zásah do statiky objektu naprosto minimální. Postupujeme v úsecích, které jsou okamžitě staticky zajišťovány, čímž eliminujeme jakékoliv riziko sedání stavby. Tato metoda je ideální pro všechny typy cihelných staveb, od starších rodinných domků až po rozsáhlé hospodářské objekty.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase italic text-neutral-dark">Postup prací řetězovou pilou</h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Příprava trasy", desc: "Očištění zdiva v místě řezu a vytyčení ideální roviny pro vložení hydroizolace." },
                  { step: "02", title: "Strojní řezání", desc: "Postupné prořezávání ložné spáry cihelného zdiva pomocí speciální řetězové pily." },
                  { step: "03", title: "Vložení izolace", desc: "Okamžité vložení PE hydroizolační folie o tloušťce 2 mm do vzniklé spáry." },
                  { step: "04", title: "Zajištění a výplň", desc: "Statické vyklínování a následné tlakové vyplnění spáry cementovou směsí." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="text-4xl font-black text-primary/20 italic shrink-0 leading-none">{s.step}</div>
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
              <h3 className="text-2xl font-black uppercase italic mb-6 relative z-10">Ideální podmínky pro tuto metodu</h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Cihelné zdivo s průběžnou spárou</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Dostatečný prostor pro manipulaci s pilou</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Požadavek na rychlost a efektivitu nákladů</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Stavby bez velkých kamenných vložek v místě řezu</span>
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
              <p className="text-neutral-dark/60 font-medium">Používáme certifikované PE folie s životností přes 50 let.</p>
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
                    <p className="text-white/70 font-medium">Zaměření a příprava pracovní spáry v úrovni podlahy.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">2</div>
                    <p className="text-white/70 font-medium">Strojní proříznutí cihelného zdiva speciální řetězovou pilou.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">3</div>
                    <p className="text-white/70 font-medium">Vložení hydroizolační PE folie o tloušťce 2 mm.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">4</div>
                    <p className="text-white/70 font-medium">Zajištění spáry statickými klíny pro okamžitou stabilitu.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">5</div>
                    <p className="text-white/70 font-medium">Tlakové vyplnění cementovou maltou pro dokonalé spojení.</p>
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
                    Požadavek pro realizaci
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Pro práci s řetězovou pilou je nutný manipulační prostor přibližně 1,5 metru z vnější nebo vnitřní strany zdi.
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
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-8">Kdy zvolit podřezávání řetězovou pilou?</h2>
            <p className="mb-6 leading-relaxed">
              Podřezávání zdiva řetězovou pilou je jednou z nejpoužívanějších a nejefektivnějších metod mechanické sanace vlhkého zdiva. Je určena především pro cihelné stavby, které mají průběžnou vodorovnou spáru. Pokud se potýkáte s opadávající omítkou, solnými výkvěty nebo plísní v interiéru, tato technologie nabízí definitivní řešení vašeho problému.
            </p>
            <p className="mb-6 leading-relaxed">
              Práce probíhají za pomoci speciálních elektrických nebo motorových pil s řeznou lištou osazenou řetězy s tvrdokovovými zuby. Celý proces je velmi rychlý – u běžného rodinného domu jsme schopni kompletně vložit novou hydroizolaci do celého obvodu v řádu několika málo dnů.
            </p>
            <p className="mb-6 leading-relaxed">
              Klíčem k úspěchu je vložení vysoce kvalitní polyethylenové (PE) fólie o tloušťce 2 mm přímo do proříznuté spáry. Tato fólie má životnost přesahující 50 let a je zcela imunní vůči agresivním látkám obsaženým ve vlhkém zdivu. Spára je následně staticky zajištěna speciálními plastovými klíny, které přebírají zatížení stavby, a nakonec tlakově vyplněna cementovou suspenzí.
            </p>
            
            <h3 className="text-2xl font-black uppercase italic text-neutral-dark mt-12 mb-6">Proč je tato metoda u cihel nejlepší?</h3>
            <p className="mb-10 leading-relaxed">
              Díky mechanickému proříznutí spáry dojde k fyzickému přerušení vzlínající vlhkosti. Oproti jiným metodám máte 100% jistotu, že hydroizolace je vložena v celé šířce zdiva a v souvislé vrstvě. Po vyschnutí zbytkové vlhkosti nad izolací se váš dům stane trvale suchým, což pocítíte na lepším klimatu i nižších nákladech na vytápění.
            </p>

            <div className="bg-neutral-light p-10 rounded-3xl border-2 border-primary/20">
              <h4 className="text-xl font-black uppercase italic text-neutral-dark mb-4">Shrnutí výhod řetězové pily:</h4>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Rychlost realizace i u větších objektů.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Příznivá cena v porovnání s diamantovým lanem.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Okamžité statické zajištění objektu.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Trvalé navrácení zdraví vaší stavbě.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-black uppercase italic mb-2">Nedávné realizace</h2>
            <p className="text-neutral-dark/60 font-medium">Prohlédněte si naše projekty, kde jsme využili řetězovou pilu.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {servicesData["retezova-pila"].relatedIds?.map(id => {
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

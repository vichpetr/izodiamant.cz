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
  title: "Podřezávání zdiva diamantovým lanem",
  description: "Sanace zdiva diamantovým lanem pro kámen a beton. Moderní technologie bez otřesů pro trvale suchý dům. Vracíme zdraví vaší stavbě.",
  keywords: ["diamantové lano", "podřezání zdiva diamantovým lanem", "sanace kamenného zdiva", "izolace betonu", "řezání betonu", "podřezání zdiva cena", "Nové Hrady", "ČR"],
  alternates: {
    canonical: 'https://izodiamant.cz/sluzby/diamantove-lano',
  },
};

export default function DiamondWirePage() {
  const data = servicesData["diamantove-lano"];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Podřezávání zdiva diamantovým lanem",
    "provider": {
      "@type": "LocalBusiness",
      "name": "IZODIAMANT"
    },
    "description": "Nejmodernější a nejuniverzálnější metoda sanace vlhkého zdiva. Poradí si s jakýmkoliv materiálem od smíšeného zdiva až po tvrdý kámen či železobeton.",
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "description": data.priceRange
      }
    }
  };
  
  const features = [
    "Vhodné pro extrémně tvrdé materiály (kámen, beton)",
    "Bez omezení tloušťky zdiva",
    "Nulové otřesy chránící statiku objektu",
    "Milimetrová přesnost řezu",
    "Vracíme zdraví vaší stavbě.",
    "Ideální pro historické a památkové objekty"
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
                <Icons.Gem className="w-4 h-4" />
                Prémiová technologie
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Podřezávání <br /><span className="text-primary">diamantovým lanem</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Profesionální podřezávání zdiva diamantovým lanem představuje nejmodernější a nejuniverzálnější metodu sanace vlhkého zdiva. Tam, kde klasické řetězové pily selhávají, nastupuje technologie diamantového lana, která si poradí s jakýmkoliv materiálem od smíšeného zdiva až po tvrdý kámen či železobeton.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Nezávazná kalkulace
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="/images/sluzby/diamantove-lano.jpg"
                alt="Podřezávání zdiva diamantovým lanem - profesionální sanace"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="prose prose-lg max-w-none mb-20 text-neutral-dark/80">
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-6">Proč zvolit diamantové lano pro sanaci a podřezávání?</h2>
            <p>
              Tato metoda je unikátní svou schopností provádět čisté řezy v libovolně silném zdivu bez vzniku nebezpečných otřesů a vibrací. Při podřezávání diamantovým lanem využíváme lano osazené průmyslovými diamanty, které je poháněno výkonným hydraulickým nebo elektrickým agregátem. Díky tomu jsme schopni sanovat i historické objekty, hrady nebo stavby s extrémně silnými zdmi, kde by jiná technologie byla neúčinná nebo riskantní z hlediska statiky.
            </p>
            <p>
              IZODIAMANT se specializuje na tuto prémiovou technologii právě pro její nekompromisní výsledky. Na rozdíl od běžných metod, diamantové lano netrpí limity hloubky řezu. Dokážeme proříznout základy o šířce dvou i více metrů, což je u masivních kamenných staveb naprostou nezbytností. Celý proces sanace zdiva je navržen tak, aby byl co nejšetrnější k původní konstrukci, přičemž vodní chlazení lana zajišťuje bezprašný provoz, což je klíčové při práci v obydlených prostorech nebo v blízkosti cenných interiérů.
            </p>
            <p>
              Po provedení řezu do spáry okamžitě vkládáme novou, vysoce odolnou hydroizolaci (nerezové plechy nebo sklolaminátové desky), která vytvoří neprostupnou bariéru proti vzlínající vlhkosti. Celý proces je zakončen statickým zajištěním a tlakovou injektáží, čímž vracíme zdraví vaší stavbě. Tato komplexní sanace zdiva zaručuje, že se vlhkost do objektu již nikdy nevrátí.
            </p>

            <h3 className="text-2xl font-black uppercase italic text-neutral-dark mt-12 mb-6">Výhody oproti klasickému podřezávání řetězovou pilou</h3>
            <p>
              Zatímco řetězová pila je vynikající pro cihelné zdivo, u kamene, betonu nebo smíšeného zdiva s tvrdými vložkami naráží na své fyzikální limity. <strong>Podřezávání diamantovým lanem</strong> tyto limity odstraňuje. Lano si poradí s armovaným betonem, čedičem i žulou. Dalším zásadním rozdílem je bezpečnost – lano nepřenáší do zdiva vibrace, které by mohly způsobit praskliny v omítkách nebo narušit klenby.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase italic text-neutral-dark">Průběh realizace diamantovým lanem</h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Příprava a diagnostika", desc: "Zaměření objektu, kontrola tloušťky a materiálu zdiva pro optimální nastavení řezného lana." },
                  { step: "02", title: "Instalace techniky", desc: "Osazení vodících kladek a upevnění agregátu pro pohon diamantového lana." },
                  { step: "03", title: "Samotný řez", desc: "Plynulé prořezávání zdiva pod neustálým chlazením, které eliminuje prašnost." },
                  { step: "04", title: "Izolace a statika", desc: "Vložení izolačního materiálu, statické vyklínování a tlaková výplň spáry." }
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
              <h3 className="text-2xl font-black uppercase italic mb-6 relative z-10">Kdy je tato metoda nejlepší volbou?</h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Zdivo o tloušťce nad 100 cm</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Tvrdý kámen, železobeton nebo prolitý beton</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Stavby s narušenou statikou vyžadující nulové otřesy</span>
                </li>
                <li className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <span>Členité historické budovy a hrady</span>
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
              <p className="text-neutral-dark/60 font-medium">Při použití sklolaminátových desek vracíme zdraví vaší stavbě.</p>
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
                    <p className="text-white/70 font-medium">Navrtání vodicích otvorů v rozích a po obvodu zdiva.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">2</div>
                    <p className="text-white/70 font-medium">Provlečení diamantového lana a zapojení do vodicích kladek stroje.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">3</div>
                    <p className="text-white/70 font-medium">Postupné řezání zdiva s chlazením lana vodou pro eliminaci prašnosti.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">4</div>
                    <p className="text-white/70 font-medium">Vložení hydroizolační vrstvy (PE folie nebo sklolaminátové desky).</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">5</div>
                    <p className="text-white/70 font-medium">Zajištění statiky pomocí speciálních klínů a tlaková injektáž cementovou směsí.</p>
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
                    Pro manipulaci se strojem a kladkami je nutný manipulační prostor minimálně 1 metr od zdi (v případě omezení lze pracovat i v 50 cm prostoru).
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
            <h2 className="text-3xl font-black uppercase italic text-neutral-dark mb-8">Kdy zvolit podřezávání diamantovým lanem?</h2>
            <p className="mb-6 leading-relaxed">
              Podřezávání zdiva diamantovým lanem představuje absolutní špičku v oboru sanace vlhkého zdiva. Tato technologie byla vyvinuta pro situace, kde standardní řetězové pily narážejí na své limity. Pokud váš objekt stojí na základech z <strong>tvrdého kamene, opracovaných kvádrů nebo železobetonu</strong>, je diamantové lano jedinou spolehlivou cestou k suchému domu.
            </p>
            <p className="mb-6 leading-relaxed">
              Hlavní výhodou této metody je její <strong>univerzálnost</strong>. Lano osazené diamantovými segmenty prochází materiálem čistým řezem, aniž by do konstrukce vnášelo nebezpečné vibrace nebo otřesy. To je klíčové zejména u historických budov a památkově chráněných objektů, kde by hrubý mechanický zásah mohl nenávratně poškodit statiku nebo dekorativní prvky fasády.
            </p>
            
            <h3 className="text-2xl font-black uppercase italic text-neutral-dark mt-12 mb-6">Technologie, která vrací zdraví vaší stavbě</h3>
            <p className="mb-6 leading-relaxed">
              Proces sanace začíná detailním technickým průzkumem. Náš tým navrhne optimální trasu řezu tak, aby byla nová hydroizolace vložena v nejvhodnějším místě nad úrovní terénu. Po proříznutí části zdiva vkládáme vysoce odolné izolační desky (sklolaminátové nebo PE), které vytvoří <strong>nepřekonatelnou bariéru proti vzlínající vlhkosti</strong>.
            </p>
            <p className="mb-10 leading-relaxed">
              Investice do podřezání diamantovým lanem se dlouhodobě vyplatí. Odstraněním vlhkosti nejen zlepšíte vnitřní mikroklima a zbavíte se plísní, ale také výrazně snížíte náklady na vytápění objektu. Suché zdivo má mnohem lepší tepelně-izolační vlastnosti než zdivo nasycené vodou.
            </p>

            <div className="bg-neutral-light p-10 rounded-3xl border-2 border-primary/20">
              <h4 className="text-xl font-black uppercase italic text-neutral-dark mb-4">Shrnutí výhod diamantového lana:</h4>
              <ul className="space-y-3 font-medium">
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Schopnost řezat jakýkoliv stavební materiál včetně armovaného betonu.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Práce bez omezení tloušťky stěn – od běžných příček po metrové hradní zdi.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Čistý a přesný řez s minimální prašností díky vodnímu chlazení.</li>
                <li className="flex items-start gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" /> Po aplikaci moderní izolace vracíme zdraví vaší stavbě.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-neutral-light overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-black uppercase italic mb-2">Nedávné realizace</h2>
            <p className="text-neutral-dark/60 font-medium">Prohlédněte si naše projekty, kde jsme využili diamantové lano.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {servicesData["diamantove-lano"].relatedIds?.map(id => {
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

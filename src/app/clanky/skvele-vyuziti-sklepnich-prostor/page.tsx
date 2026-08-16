import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import Image from "next/image";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/clanky/skvele-vyuziti-sklepnich-prostor',
    title: "Využití sklepních prostor: ze sklepa plnohodnotný prostor",
    description: "Jak z vlhkého a nevyužitého sklepa udělat suchou spíž, dílnu nebo vinný sklep. Podmínkou je odstranění vzlínající vlhkosti – sanace zdiva. Vracíme zdraví vaší stavbě.",
    images: ['/images/clanky/sklep.jpg'],
  }),
  keywords: ["využití sklepních prostor", "vlhký sklep", "sanace sklepa", "suchý sklep", "vinný sklep", "sklep jako obytný prostor", "odvlhčení sklepa", "vzlínající vlhkost"],
};

const PUBLISHED = "2026-08-16";

export default function CellarArticlePage() {
  const url = "https://izodiamant.cz/clanky/skvele-vyuziti-sklepnich-prostor";

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Skvělé využití sklepních prostor: ze sklepa plnohodnotný prostor",
    "description": "Jak z vlhkého a nevyužitého sklepa udělat suchou a využitelnou místnost. Klíčem je odstranění vzlínající vlhkosti sanací zdiva.",
    "image": "https://izodiamant.cz/images/clanky/sklep.jpg",
    "datePublished": PUBLISHED,
    "dateModified": PUBLISHED,
    "author": { "@type": "Organization", "name": "IZODIAMANT" },
    "publisher": {
      "@type": "Organization",
      "name": "IZODIAMANT",
      "logo": { "@type": "ImageObject", "url": "https://izodiamant.cz/logo.png" },
    },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
  };

  const breadcrumb = breadcrumbSchema([
    { name: "Domů", path: "/" },
    { name: "Články", path: "/clanky/skvele-vyuziti-sklepnich-prostor" },
    { name: "Využití sklepních prostor", path: "/clanky/skvele-vyuziti-sklepnich-prostor" },
  ]);

  const uses = [
    { title: "Spíž a sklad", desc: "Klasické a nejčastější využití – chladný, tmavý a suchý prostor pro potraviny, zavařeniny i sezónní věci." },
    { title: "Vinný sklep", desc: "Stabilní teplota a vlhkost dělá ze sklepa ideální místo pro archivaci vína. Podmínkou je ale kontrola nad vlhkostí, ne zatuchlý vzduch." },
    { title: "Dílna a hobby", desc: "Ponk, nářadí, kutilský koutek. Suchý sklep ochrání nástroje před korozí a materiál před plísní." },
    { title: "Technická místnost a prádelna", desc: "Kotel, bojler, pračka se sušičkou – praktické přesunout mimo obytné patro. Vyžaduje to ale suché zdivo a odvětrání." },
    { title: "Fitness nebo relaxace", desc: "Menší posilovna, sauna či klidový koutek. Tady je suché a zdravé prostředí úplný základ." },
  ];

  return (
    <main className="min-h-screen bg-neutral-light">
      {/* JSON-LD jako plain <script>, aby byl v serverovém HTML i pro crawlery bez JS. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <Header />

      <article className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-neutral-dark/60 hover:text-primary font-bold uppercase tracking-widest text-xs mb-10 transition-colors group">
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Zpět na hlavní stránku
          </Link>

          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic mb-4">Rádce · Sanace zdiva</div>
          <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.92] mb-8">
            Skvělé využití <span className="text-primary-ink">sklepních prostor</span>
          </h1>
          <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-4">
            Sklep bývá nejméně využitá část domu – často kvůli vlhkosti, plísni a zatuchlému vzduchu. Přitom právě
            sklep dokáže přidat cenné metry navíc: spíž, dílnu, vinný sklep i technickou místnost. Podmínka je ale
            jediná a zásadní – <strong className="text-neutral-dark">suché zdivo</strong>.
          </p>

          <figure className="mt-8">
            <div className="relative aspect-[3/2] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/clanky/sklep.jpg"
                alt="Kamenný klenutý sklep se schodištěm ven a dřevěnou lávkou"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                priority
              />
            </div>
            <figcaption className="text-[11px] text-neutral-dark/40 font-medium mt-2 text-right">Foto: Pixabay</figcaption>
          </figure>

          <div className="prose prose-lg max-w-none text-neutral-dark/80 mt-12 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark">Proč sklepy leží ladem</h2>
            <p>
              Většina starších sklepů nemá funkční vodorovnou izolaci. Vlhkost proto vzlíná zdivem z podloží nahoru
              (tzv. vzlínající vlhkost) a projevuje se vlhkými mapami, opadávající omítkou, bílými solnými výkvěty a
              plísní v rozích. V takovém prostoru nechcete skladovat potraviny ani trávit čas – a časem trpí i
              statika a tepelně-izolační vlastnosti domu.
            </p>
            <p>
              Dobrá zpráva: vzlínající vlhkost jde spolehlivě a trvale přerušit. Jakmile je sklep suchý, otevírá se
              řada možností, jak ho využít.
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark mt-14 mb-6">Na co všechno sklep využít</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {uses.map((u, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase italic text-neutral-dark text-sm mb-1">{u.title}</h3>
                    <p className="text-neutral-dark/70 text-sm leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="prose prose-lg max-w-none text-neutral-dark/80 mt-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark">Podmínka číslo jedna: suchý sklep</h2>
            <p>
              Ať už sklep využijete jakkoli, prvním krokem je vždy odstranění příčiny vlhkosti. U vzlínající zemní
              vlhkosti to znamená vytvořit novou vodorovnou hydroizolační bariéru. Používáme tři osvědčené metody a
              tu nejvhodnější volíme podle materiálu a stavu zdiva:
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Link href="/sluzby/retezova-pila" className="group bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:border-primary/30 transition-all">
              <div className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors mb-1">Řetězová pila</div>
              <p className="text-neutral-dark/60 text-xs leading-relaxed">Rychlé podřezání cihelného zdiva s pravidelnou spárou.</p>
            </Link>
            <Link href="/sluzby/diamantove-lano" className="group bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:border-primary/30 transition-all">
              <div className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors mb-1">Diamantové lano</div>
              <p className="text-neutral-dark/60 text-xs leading-relaxed">Pro kamenné, betonové i smíšené zdivo bez limitu tloušťky.</p>
            </Link>
            <Link href="/sluzby/chemicka-injektaz" className="group bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:border-primary/30 transition-all">
              <div className="font-black uppercase italic text-sm text-neutral-dark group-hover:text-primary transition-colors mb-1">Chemická injektáž</div>
              <p className="text-neutral-dark/60 text-xs leading-relaxed">Tam, kde nelze mechanicky řezat – členité či špatně přístupné zdivo.</p>
            </Link>
          </div>

          <div className="prose prose-lg max-w-none text-neutral-dark/80 mt-14 space-y-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark">Jak sklep připravit k užívání</h2>
            <p>
              Po přerušení vzlínající vlhkosti zdivo nad izolací postupně vysychá (u silných stěn i několik měsíců).
              Na podřezání navazuje otlučení zasolených omítek a nahození prodyšných sanačních omítek, které odvedou
              zbytkovou vlhkost a soli. Důležité je i dostatečné větrání – ať přirozené, nebo řízené. Teprve suchý a
              odvětraný sklep je připravený stát se plnohodnotným prostorem.
            </p>
            <p>
              Jestli si nejste jistí, jestli je vlhkost ve sklepě vzlínající, nebo způsobená třeba zatékáním či
              chybějící drenáží, doporučíme správné řešení po prohlídce a měření vlhkosti přímo na místě.
            </p>
          </div>

          <div className="mt-14 bg-neutral-dark rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 -rotate-12 translate-x-12 -translate-y-12" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-3">Máte vlhký sklep?</h2>
              <p className="text-white/70 font-medium mb-8 max-w-xl">
                Ozvěte se nám na nezávaznou prohlídku zdarma. Změříme vlhkost, navrhneme nejvhodnější postup a
                pomůžeme vám ze sklepa udělat suchý a využitelný prostor. Vracíme zdraví vaší stavbě.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Nezávazná kalkulace
                </Link>
                <a href="tel:+420737017012" className="inline-flex items-center gap-2 py-4 px-8 rounded-xl border-2 border-white/15 font-black uppercase tracking-widest text-sm text-white hover:border-primary/40 transition-colors">
                  <Icons.Phone className="w-4 h-4 text-primary" /> +420 737 017 012
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}

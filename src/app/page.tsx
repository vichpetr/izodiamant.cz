import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Technology from "@/components/Technology";
import AboutSection from "@/components/AboutSection";
import { SectionSkeleton } from "@/components/Skeleton";
import { Metadata } from 'next';
import Link from "next/link";
import { Icons } from "@/components/Icons";
import { pageMetadata } from "@/lib/seo";
import referencesData from "@/data/references.json";

export const metadata: Metadata = {
  ...pageMetadata({
    path: '',
    title: "Podřezání a sanace vlhkého zdiva po celé ČR",
    description: "Podřezání a sanace vlhkého zdiva – diamantové lano, řetězová pila, chemická injektáž. Orientační cena od 2 500 Kč/bm, kalkulačka online. Sídlíme ve východních Čechách, jezdíme po celé ČR. Vracíme zdraví vaší stavbě.",
  }),
  // Homepage je kořenový segment – title.template z layoutu se na něj NEAPLIKUJE,
  // takže značku „| IZODIAMANT" musíme doplnit ručně. (Nezdvojí se: OG title si
  // pageMetadata staví z holého názvu, tady přepisujeme jen <title>.)
  title: "Podřezání a sanace vlhkého zdiva po celé ČR | IZODIAMANT",
  keywords: ["sanace zdiva", "sanace vlhkého zdiva", "izolace vlhkého zdiva", "podřezávání zdiva", "podřezání zdiva", "podřezání domu cena", "diamantové lano", "řetězová pila", "chemická injektáž", "odvlhčení zdiva", "hydroizolace", "sanační omítky", "diagnostika vlhkosti", "izolace zdi", "izolace domu", "vzlínající vlhkost", "plísně ve zdivu", "vlhké zdivo", "IZODIAMANT", "Nové Hrady"],
};

// Components that are SSR by default for SEO
const References = dynamic(() => import("@/components/References"));
const HomeArticles = dynamic(() => import("@/components/HomeArticles"));
const HomeReviews = dynamic(() => import("@/components/HomeReviews"));
const FAQ = dynamic(() => import("@/components/FAQ"));

// Interactive components with loading states
const PricingCalculator = dynamic(() => import("@/components/PricingCalculator"), {
  loading: () => <SectionSkeleton />
});
const ContactForm = dynamic(() => import("@/components/ContactForm"), {
  loading: () => <SectionSkeleton />
});

const Footer = dynamic(() => import("@/components/Footer"));

// SEO Problem-focused section with target keywords
function ProblemSection() {
  return (
    <section className="py-20 bg-white" id="problemy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-6">
            Trápí vás vlhké zdivo, plísně<br />nebo vzlínající vlhkost?
          </h2>
          <p className="text-lg text-neutral-dark/70 font-medium leading-relaxed">
            Vlhké zdivo ničí omítky, způsobuje plísně a zvyšuje náklady na vytápění. Zajišťujeme sanaci a izolaci vlhkého zdiva moderními technologiemi – od diagnostiky a měření vlhkosti až po trvalé odstranění příčiny.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Icons.Droplet,
              title: "Vzlínající vlhkost zdiva",
              text: "Vlhkost vzlíná zdivem a vytváří vlhké mapy. Bez zásahu se problém neustále zhoršuje a postupně ničí stavbu. Vlhké zdivo má až 5× horší tepelně-izolační vlastnosti než suché.",
            },
            {
              icon: Icons.Mold,
              title: "Plísně ve zdivu",
              text: "Vlhké prostředí je ideální pro růst plísní, které škodí nejen stavbě, ale i zdraví vaší rodiny. Plísně ve zdivu jsou častý problém v domech bez funkční hydroizolace.",
            },
            {
              icon: Icons.Thermometer,
              title: "Ztráta tepla a vyšší náklady",
              text: "Mokré zdivo dramaticky zhoršuje tepelnou izolaci domu. Sanace vlhkého zdiva nejen ochrání stavbu, ale výrazně sníží vaše náklady na vytápění.",
            },
          ].map((item, index) => (
            <div key={index} className="bg-neutral-light p-8 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                <item.icon className="w-6 h-6 text-primary-ink group-hover:text-neutral-dark" />
              </div>
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-3 tracking-tight">
                {item.title}
              </h3>
              <p className="text-neutral-dark/70 font-medium leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-primary/5 rounded-3xl p-8 md:p-12 border-2 border-primary/10">
          <h3 className="text-2xl font-black text-neutral-dark uppercase italic mb-6">
            Jak trvale odstranit vlhkost zdiva?
          </h3>
          <p className="text-neutral-dark/70 font-medium leading-relaxed mb-6">
            Nejspolehlivější izolace vlhkého zdiva je jeho podřezání a vložení souvislé hydroizolační bariéry. Nabízíme tři moderní technologie – podřezávání diamantovým lanem pro kámen a beton, řetězovou pilu pro cihelné zdivo a chemickou injektáž pro místa, kde nelze řezat. Každou zakázku začínáme diagnostikou a měřením vlhkosti zdiva a zakončujeme zárukou na provedené práce.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
              <h4 className="font-black text-primary-ink uppercase text-sm tracking-widest mb-2">Diamantové lano</h4>
              <p className="text-neutral-dark/70 font-medium text-sm leading-relaxed">Pro kámen, beton a smíšené zdivo. Milimetrová přesnost bez otřesů.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
              <h4 className="font-black text-primary-ink uppercase text-sm tracking-widest mb-2">Řetězová pila</h4>
              <p className="text-neutral-dark/70 font-medium text-sm leading-relaxed">Nejrychlejší metoda pro cihelné zdivo. Okamžité vložení hydroizolace.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
              <h4 className="font-black text-primary-ink uppercase text-sm tracking-widest mb-2">Chemická injektáž</h4>
              <p className="text-neutral-dark/70 font-medium text-sm leading-relaxed">Bezhlučný proces. Vodoodpudivá bariéra přímo uvnitř zdiva.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/#calculator"
            className="btn-primary py-4 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center justify-center gap-3"
          >
            Spočítat cenu sanace
            <Icons.Calculator className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Oblasti působení – lokální relevance (východní Čechy) + interní prolinkování.
// Záměrně bez samostatných stránek měst (viz odstraněné /mesta – osamocené a duplicitní).
function AreasSection() {
  const regions = [
    "Pardubický kraj",
    "Královéhradecký kraj",
    "Středočeský kraj",
    "Praha",
  ];
  const cities = [
    "Pardubice", "Chrudim", "Hradec Králové", "Ústí nad Orlicí",
    "Vysoké Mýto", "Litomyšl", "Polička", "Svitavy",
    "Sloupnice", "Staré Ždánice",
  ];

  // Kde máme doloženou realizaci, odkážeme na konkrétní referenci. Lokální
  // relevance opřená o skutečnou zakázku – ne o šablonovou stránku města
  // (proto byly /mesta zrušeny). Páruje se přes location, aby se seznamy
  // nemohly rozejít.
  const referenceFor = (city: string) =>
    referencesData.find((r) => r.location.startsWith(city))?.id;

  return (
    <section className="py-20 bg-neutral-light" id="oblasti-pusobeni">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-6">
            Kde podřezáváme a sanujeme vlhké zdivo
          </h2>
          <p className="text-lg text-neutral-dark/70 font-medium leading-relaxed max-w-3xl mx-auto">
            Sídlíme ve východních Čechách a na sanaci a izolaci vlhkého zdiva vyjíždíme po celé České republice.
            Podřezání a sanaci vlhkého zdiva realizujeme mimo jiné v Pardubicích, Chrudimi, Hradci Králové,
            Ústí nad Orlicí, Vysokém Mýtě, Litomyšli, Poličce a Svitavách – a pravidelně i v Praze a okolí.
            Prohlídka objektu a zpracování nezávazné cenové nabídky jsou zdarma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-8 rounded-2xl border border-neutral-dark/5">
            <h3 className="text-sm font-black text-primary-ink uppercase tracking-widest mb-4">Kraje, kde působíme</h3>
            <ul className="grid grid-cols-2 gap-2">
              {regions.map((r) => (
                <li key={r} className="flex items-center gap-2 text-neutral-dark/70 font-medium">
                  <Icons.MapPin className="w-4 h-4 text-primary-ink shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-neutral-dark/5">
            <h3 className="text-sm font-black text-primary-ink uppercase tracking-widest mb-4">Vybraná města</h3>
            <ul className="grid grid-cols-2 gap-2">
              {cities.map((c) => {
                const refId = referenceFor(c);
                return (
                  <li key={c} className="flex items-center gap-2 text-neutral-dark/70 font-medium">
                    <Icons.MapPin className="w-4 h-4 text-primary-ink shrink-0" />
                    {refId ? (
                      <Link
                        href={`/reference/${refId}`}
                        className="text-primary-ink font-bold hover:underline"
                      >
                        {c}
                      </Link>
                    ) : (
                      c
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <p className="text-neutral-dark/70 font-medium mb-6">
            Vyberte metodu podle typu zdiva:{" "}
            <Link href="/sluzby/diamantove-lano" className="text-primary-ink font-bold hover:underline">diamantové lano</Link>{" "}
            (kámen, beton),{" "}
            <Link href="/sluzby/retezova-pila" className="text-primary-ink font-bold hover:underline">řetězová pila</Link>{" "}
            (cihla) nebo{" "}
            <Link href="/sluzby/chemicka-injektaz" className="text-primary-ink font-bold hover:underline">chemická injektáž</Link>.
          </p>
          <Link
            href="/#calculator"
            className="btn-primary py-4 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center justify-center gap-3"
          >
            Spočítat cenu podřezání
            <Icons.Calculator className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Technology />
      <AboutSection />
      <ProblemSection />
      <PricingCalculator />
      <References />
      <AreasSection />
      <HomeReviews />
      <HomeArticles />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  );
}

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Technology from "@/components/Technology";
import AboutSection from "@/components/AboutSection";
import { SectionSkeleton } from "@/components/Skeleton";
import { Metadata } from 'next';
import Link from "next/link";
import { Icons } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Sanace a podřezávání zdiva – komplexní řešení | IZODIAMANT",
  description: "Specialisté na sanace vlhkého zdiva po celé České republice. Podřezávání diamantovým lanem, řetězovou pilou a chemická injektáž. Vracíme zdraví vaší stavbě.",
  keywords: ["sanace zdiva", "podřezávání zdiva", "podřezání zdiva", "podřezání domu cena", "diamantové lano", "řetězová pila", "chemická injektáž", "odvlhčení zdiva", "sanace vlhkého zdiva", "hydroizolace", "izolace zdi", "izolace domu", "vzlínající vlhkost", "plísně ve zdivu", "vlhké zdivo", "IZODIAMANT", "Nové Hrady"],
};

// Components that are SSR by default for SEO
const References = dynamic(() => import("@/components/References"));
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
          <p className="text-lg text-neutral-dark/60 font-medium leading-relaxed">
            Vlhké zdivo ničí omítky, způsobuje plísně a zvyšuje náklady na vytápění. Nabízíme trvalé odstranění vlhkosti zdiva pomocí moderních technologií.
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
          <h3 className="text-2xl font-black text-neutral-dark uppercase italic mb-6">
            Jak trvale odstranit vlhkost zdiva?
          </h3>
          <p className="text-neutral-dark/70 font-medium leading-relaxed mb-6">
            Jediný trvalý způsob, jak se zbavit vlhkého zdiva, je jeho podřezání a následné vložení hydroizolační bariéry. Nabízíme tři moderní technologie – podřezávání diamantovým lanem pro kámen a beton, řetězovou pilu pro cihelné zdivo a chemickou injektáž pro lokální problémy. Každou zakázku začínáme důkladnou diagnostikou a zakončujeme zárukou na provedené práce.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
              <h4 className="font-black text-primary uppercase text-sm tracking-widest mb-2">Diamantové lano</h4>
              <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">Pro kámen, beton a smíšené zdivo. Milimetrová přesnost bez otřesů.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
              <h4 className="font-black text-primary uppercase text-sm tracking-widest mb-2">Řetězová pila</h4>
              <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">Nejrychlejší metoda pro cihelné zdivo. Okamžité vložení hydroizolace.</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-neutral-light/50">
              <h4 className="font-black text-primary uppercase text-sm tracking-widest mb-2">Chemická injektáž</h4>
              <p className="text-neutral-dark/60 font-medium text-sm leading-relaxed">Bezhlučný proces. Vodoodpudivá bariéra přímo uvnitř zdiva.</p>
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
      <HomeReviews />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  );
}

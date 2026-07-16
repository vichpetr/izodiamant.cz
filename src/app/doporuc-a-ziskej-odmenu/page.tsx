import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: '/doporuc-a-ziskej-odmenu',
    title: "Doporuč a získej odměnu",
    description: "Doporučte nám nového zákazníka na sanaci vlhkého zdiva a získejte finanční odměnu. Přečtěte si, jak program funguje a jaké jsou podmínky.",
  }),
  keywords: ["doporuč a získej odměnu", "provize za doporučení", "odměna za tip", "sanace zdiva", "IZODIAMANT"],
};

const steps = [
  {
    step: "01",
    title: "Dejte nám tip",
    desc: "Ozvěte se telefonicky nebo e-mailem a sdělte nám kontakt na majitele objektu, který řeší vlhké zdivo. Uveďte i své jméno a telefon, abychom věděli, komu odměna náleží.",
  },
  {
    step: "02",
    title: "Ozveme se klientovi",
    desc: "Doporučeného klienta kontaktujeme, domluvíme nezávaznou prohlídku objektu a zpracujeme cenovou nabídku na míru.",
  },
  {
    step: "03",
    title: "Realizujeme zakázku",
    desc: "Pokud klient nabídku přijme, provedeme sanaci. O průběhu vás nemusíme informovat – vaše role tipem končí.",
  },
  {
    step: "04",
    title: "Vyplatíme odměnu",
    desc: "Po řádném dokončení a proplacení zakázky vám vyplatíme finanční odměnu. Její výši dohodneme individuálně podle rozsahu doporučené zakázky.",
  },
];

export default function ReferralProgramPage() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />

      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest mb-6">
            <Icons.Coins className="w-4 h-4" />
            Program pro doporučitele
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.95] mb-8">
            Doporuč <span className="text-primary">a získej odměnu</span>
          </h1>
          <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-12">
            Znáte někoho, kdo řeší vlhké zdivo? Doporučte nás a získejte finanční odměnu. Stačí nám dát tip – o všechno ostatní se postaráme sami.
          </p>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-neutral-dark/5 mb-12">
            <h2 className="text-2xl font-black uppercase italic text-neutral-dark mb-8">Jak to funguje</h2>
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.step} className="flex gap-6 items-start">
                  <div className="text-4xl font-black text-primary/20 italic shrink-0 leading-none">{s.step}</div>
                  <div>
                    <h3 className="text-lg font-black uppercase italic text-neutral-dark mb-1">{s.title}</h3>
                    <p className="text-neutral-dark/70 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-dark text-white p-8 md:p-12 rounded-3xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 -rotate-12 translate-x-10 -translate-y-10" />
            <h2 className="text-2xl font-black uppercase italic mb-6 relative z-10">Podmínky programu</h2>
            <ul className="space-y-4 relative z-10">
              <li className="flex items-start gap-3">
                <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 font-medium">Váš tip musíme obdržet jako první – tedy dříve, než nás doporučený klient sám kontaktuje. Na tip na klienta, který už s námi jedná, se odměna nevztahuje.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 font-medium">Odměnu vyplácíme až po řádném dokončení zakázky a jejím proplacení doporučeným klientem.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 font-medium">Výši odměny dohodneme individuálně podle rozsahu doporučené zakázky. Sdělíme vám ji dopředu, jakmile bude nabídka pro klienta zpracována.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 font-medium">Počet doporučení není omezen. Odměna náleží za každou realizovanou zakázku.</span>
              </li>
              <li className="flex items-start gap-3">
                <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <span className="text-white/80 font-medium">Kontaktní údaje doporučeného klienta použijeme výhradně pro zpracování nabídky, v souladu se <Link href="/ochrana-udaju" className="text-primary hover:underline">zásadami ochrany osobních údajů</Link>. Doporučujte prosím jen ty, kdo o oslovení stojí.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border-2 border-primary/20 text-center">
            <h2 className="text-2xl font-black uppercase italic text-neutral-dark mb-4">Máte tip?</h2>
            <p className="text-neutral-dark/70 font-medium mb-8 max-w-xl mx-auto leading-relaxed">
              Zavolejte nám nebo napište. Stačí kontakt na majitele objektu a vaše jméno – zbytek vyřídíme za vás.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+420737017012" className="btn-primary py-4 px-8 uppercase tracking-widest inline-flex items-center gap-2">
                <Icons.Phone className="w-4 h-4" />
                +420 737 017 012
              </a>
              <Link href="/#contact" className="btn-outline py-4 px-8 uppercase tracking-widest text-sm">
                Napsat zprávu
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

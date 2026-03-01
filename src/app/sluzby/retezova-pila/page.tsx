import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Zap, CheckCircle2, ShieldCheck, Clock, Coins, Construction } from "lucide-react";
import Link from "next/link";

export default function ChainSawPage() {
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
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest mb-6">
                <Zap className="w-4 h-4" />
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
                  Spočítat cenu pro cihlu
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://i0.wp.com/izodiamant.cz/wp-content/uploads/2023/07/IMG_20230522_153306-e1689370669906.jpg')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Coins className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Cena</h3>
              <p className="text-neutral-dark/60 font-medium">Od 2 500 do 3 500 Kč za m² podle tloušťky zdiva.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Clock className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Rychlost</h3>
              <p className="text-neutral-dark/60 font-medium">Nejrychlejší mechanická metoda, rodinný dům hotov za 2–3 dny.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <ShieldCheck className="w-10 h-10 text-primary mb-6" />
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
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="flex items-center gap-2 font-black uppercase text-xs mb-4 text-primary italic">
                    <Construction className="w-4 h-4" />
                    Vhodné materiály
                  </h4>
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

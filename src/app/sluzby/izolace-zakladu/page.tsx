import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, CheckCircle2, Clock, Coins, Construction, Landmark } from "lucide-react";
import Link from "next/link";

export default function FoundationInsulationPage() {
  const features = [
    "Komplexní ochrana spodní stavby",
    "Zamezení pronikání zemní vlhkosti a radonu",
    "Zvýšení životnosti celého objektu",
    "Vhodné pro rekonstrukce i novostavby",
    "Použití špičkových asfaltových a PVC pásů",
    "Možnost kombinace s drenážním systémem"
  ];

  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest mb-6">
                <Landmark className="w-4 h-4" />
                Ochrana stavby
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Izolace <br /><span className="text-primary">základů</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Kvalitní izolace základů je klíčovým prvkem pro zajištění dlouhé životnosti a zdravého klimatu v domě. Specializujeme se na svislé i vodorovné izolace spodní stavby, které zamezí prostupu zemní vlhkosti, beztlakové i tlakové vody do konstrukce objektu.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Poptat izolaci
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Coins className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Cena</h3>
              <p className="text-neutral-dark/60 font-medium">Individuální nacenění podle rozsahu a zvolené technologie (pásy, stěrky).</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Clock className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Rychlost</h3>
              <p className="text-neutral-dark/60 font-medium">Závisí na náročnosti zemních prací, běžně hotovo do týdne.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <ShieldCheck className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Záruka</h3>
              <p className="text-neutral-dark/60 font-medium">Používáme materiály s atesty a certifikovanou životností desítky let.</p>
            </div>
          </div>

          <div className="bg-neutral-dark rounded-[3rem] p-8 md:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-20" />
            <div className="relative z-10 grid lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-3xl font-black uppercase italic mb-8">Postup prací</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">1</div>
                    <p className="text-white/70 font-medium">Odkopání základového zdiva a jeho očištění od nesoudržných částí.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">2</div>
                    <p className="text-white/70 font-medium">Vyrovnání povrchu sanačním podkladem nebo cementovou stěrkou.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">3</div>
                    <p className="text-white/70 font-medium">Aplikace penetrace a následné navaření nebo nalepení izolační vrstvy.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">4</div>
                    <p className="text-white/70 font-medium">Montáž ochranné nopové fólie a zateplení soklu (pokud je v plánu).</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-neutral-dark font-black shrink-0">5</div>
                    <p className="text-white/70 font-medium">Zásyp zeminou nebo kamenivem s instalací drenážního potrubí.</p>
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
                    Individuální návrh
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Každá stavba vyžaduje jiný přístup. Na základě vlhkostního průzkumu navrhneme optimální materiálovou skladbu pro vaše základy.
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

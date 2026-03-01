import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Gem, CheckCircle2, ShieldCheck, Clock, Coins, Construction } from "lucide-react";
import Link from "next/link";

export default function DiamondWirePage() {
  const features = [
    "Vhodné pro extrémně tvrdé materiály (kámen, beton)",
    "Bez omezení tloušťky zdiva",
    "Nulové otřesy chránící statiku objektu",
    "Milimetrová přesnost řezu",
    "Doživotní záruka na vloženou izolaci",
    "Ideální pro historické a památkové objekty"
  ];

  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest mb-6">
                <Gem className="w-4 h-4" />
                Prémiová technologie
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                Podřezávání <br /><span className="text-primary">diamantovým lanem</span>
              </h1>
              <p className="text-xl text-neutral-dark/70 font-medium leading-relaxed mb-10">
                Nejmodernější a nejuniverzálnější metoda sanace vlhkého zdiva. Tam, kde klasické řetězové pily selhávají, nastupuje diamantové lano. Tato technologie si poradí s jakýmkoliv materiálem od smíšeného zdiva až po tvrdý kámen či železobeton.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20">
                  Spočítat orientační cenu
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://izodiamant.cz/wp-content/uploads/2023/07/IMG_20230501_085129-e1689370824575.jpg')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-transparent to-transparent" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Coins className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Cena</h3>
              <p className="text-neutral-dark/60 font-medium">Od 4 500 do 6 500 Kč za m² v závislosti na tloušťce a materiálu.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <Clock className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Rychlost</h3>
              <p className="text-neutral-dark/60 font-medium">Standardní rodinný dům realizujeme obvykle do 3–5 pracovních dnů.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-neutral-dark/5">
              <ShieldCheck className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black text-neutral-dark uppercase mb-2">Záruka</h3>
              <p className="text-neutral-dark/60 font-medium">Při použití sklolaminátových desek garantujeme doživotní funkčnost.</p>
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
                      <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/10">
                  <h4 className="flex items-center gap-2 font-black uppercase text-xs mb-4 text-primary italic">
                    <Construction className="w-4 h-4" />
                    Požadavek pro realizaci
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed font-medium">
                    Pro manipulaci se strojem a kladkami je nutný manipulační prostor minimálně 1 metr od zdi (v případě omezení lze pracovat i v 50 cm prostoru).
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

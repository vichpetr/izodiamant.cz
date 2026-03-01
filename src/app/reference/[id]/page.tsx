import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReferenceSlider from "@/components/ReferenceSlider";
import { MapPin, ArrowLeft, Gem, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Project {
  title: string;
  location: string;
  technology: string;
  scope: string;
  duration: string;
  description: string;
  features: string[];
  before: string;
  after: string;
}

const projects: Record<string, Project> = {
  'zamek-zleby': {
    title: 'Sanace kamenného zdiva zámku Žleby',
    location: 'Žleby, okr. Kutná Hora',
    technology: 'Diamantové lano',
    scope: '320 m² řezné plochy',
    duration: '14 pracovních dnů',
    description: 'Komplexní sanace historického kamenného zdiva v suterénních prostorách zámku. Vzhledem k extrémní tloušťce zdiva (až 180 cm) a požadavku na nulové otřesy byla zvolena technologie diamantového lana.',
    features: [
      'Řezání kamene o tloušťce 180 cm',
      'Vložení nerezové izolace',
      'Tlaková injektáž cementovou směsí',
      'Nulové narušení statiky objektu'
    ],
    before: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=1200&auto=format&fit=crop&grayscale',
  },
  'bytovy-dum-praha': {
    title: 'Izolace základů bytového domu',
    location: 'Praha 10 - Hostivař',
    technology: 'Řetězová pila',
    scope: '85 běžných metrů',
    duration: '4 pracovní dny',
    description: 'Dodatečná hydroizolace cihlového bytového domu z 50. let. Práce probíhaly za plného provozu domu bez nutnosti vystěhování nájemníků.',
    features: [
      'Rychlý postup řetězovou pilou',
      'Vložení PE folie 2mm',
      'Statické zajištění klíny',
      'Finální zapravení spáry'
    ],
    before: 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=1200&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1541976590-713941681591?q=80&w=1200&auto=format&fit=crop&grayscale',
  },
  'chalupa-krkonose': {
    title: 'Podřezání vlhké chalupy',
    location: 'Vrchlabí',
    technology: 'Diamantové lano',
    scope: '42 běžných metrů',
    duration: '3 pracovní dny',
    description: 'Sanace smíšeného zdiva (kámen/cihla) u rekreačního objektu. Technologie diamantového lana umožnila čistý řez i v místech s nerovným terénem.',
    features: [
      'Řezání smíšeného zdiva',
      'Aplikace sklolaminátové desky',
      'Sanace vnitřních omítek',
      'Záruka 30 let na izolaci'
    ],
    before: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1200&auto=format&fit=crop&grayscale',
  }
};

export async function generateStaticParams() {
  return [
    { id: 'zamek-zleby' },
    { id: 'bytovy-dum-praha' },
    { id: 'chalupa-krkonose' },
  ];
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = projects[id];

  if (!project) return <div>Projekt nenalezen</div>;

  return (
    <main className="min-h-screen bg-neutral-light text-foreground">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/#reference" 
            className="inline-flex items-center gap-2 text-neutral-dark/60 hover:text-primary font-bold uppercase tracking-widest text-xs mb-12 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Zpět na reference
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12">
              <div>
                <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest mb-6">
                  {project.technology === 'Diamantové lano' ? <Gem className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {project.technology}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                  {project.title}
                </h1>
                <div className="flex items-center gap-2 text-neutral-dark/60 font-bold uppercase tracking-widest text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  {project.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-neutral-dark/10 text-foreground">
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Rozsah prací</div>
                  <div className="text-xl font-black uppercase italic">{project.scope}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Doba realizace</div>
                  <div className="text-xl font-black uppercase italic">{project.duration}</div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xs font-black text-neutral-dark uppercase tracking-[0.3em]">Specifikace projektu</h2>
                <p className="text-lg text-neutral-dark/70 font-medium leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-xs font-black text-neutral-dark uppercase tracking-[0.3em]">Klíčové body</h2>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {project.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-neutral-dark font-bold uppercase tracking-tight">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="sticky top-32 space-y-8">
              <ReferenceSlider before={project.before} after={project.after} />
              
              <div className="bg-neutral-dark rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary opacity-5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase italic mb-4">Máte podobný projekt?</h3>
                  <p className="text-white/60 font-medium mb-8">
                    Rádi pro vás připravíme detailní technický návrh a nezávaznou cenovou nabídku.
                  </p>
                  <Link href="/#calculator" className="btn-primary inline-flex py-4 px-8 uppercase tracking-widest">
                    Poptat realizaci
                  </Link>
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

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import dynamic from 'next/dynamic';
import { Icons } from "@/components/Icons";
import Link from "next/link";
import Image from "next/image";
import referencesData from '@/data/references.json';
import { Metadata } from 'next';

const ProjectReview = dynamic(() => import("@/components/ProjectReview"), { ssr: true });
const ProjectGallery = dynamic(() => import("@/components/ProjectGallery"), { ssr: true });

interface Project {
  id: string;
  title: string;
  location: string;
  date: string;
  technology: string;
  scope: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
  gallery?: string[];
  reviewId?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = (referencesData as Project[]).find(p => p.id === id);

  if (!project) return { title: 'Projekt nenalezen' };

  const title = project.title.includes(project.location) || project.title.includes(project.location.split(' ')[0])
    ? project.title 
    : `${project.title} – ${project.location}`;
  const description = `${project.title} (${project.technology}). ${project.description.substring(0, 70)}... Vracíme zdraví vaší stavbě.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | IZODIAMANT`,
      description,
      images: [project.image],
    },
    alternates: {
      canonical: `https://izodiamant.cz/reference/${project.id}`,
    },
  };
}

export async function generateStaticParams() {
  return referencesData.map((project) => ({
    id: project.id,
  }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = (referencesData as Project[]).find(p => p.id === id);

  if (!project) return <div>Projekt nenalezen</div>;

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 2) return dateStr;
    const months = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];
    const monthIndex = parseInt(parts[1]) - 1;
    return `${months[monthIndex]} ${parts[0]}`;
  };

  return (
    <main className="min-h-screen bg-neutral-light text-foreground">
      <Header />
      
      <section className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/#reference" 
            className="inline-flex items-center gap-2 text-neutral-dark/60 hover:text-primary font-bold uppercase tracking-widest text-xs mb-12 transition-colors group"
          >
            <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Zpět na přehled
          </Link>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-12">
              <div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary font-black text-xs uppercase tracking-widest">
                    {project.technology.includes('lano') ? <Icons.Gem className="w-4 h-4" /> : <Icons.Zap className="w-4 h-4" />}
                    {project.technology}
                  </div>
                  <div className="inline-flex items-center gap-3 bg-neutral-dark/5 px-4 py-2 rounded-lg text-neutral-dark/60 font-black text-xs uppercase tracking-widest">
                    <Icons.Calendar className="w-4 h-4" />
                    {formatDate(project.date)}
                  </div>
                  {project.reviewId && (
                    <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-lg text-neutral-dark/60 font-black text-xs uppercase tracking-widest border border-neutral-dark/5 shadow-sm">
                      <Icons.CheckCircle2 className="w-4 h-4 text-primary" />
                      Ověřená reference
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.9] mb-8">
                  Realizace sanace: {project.title}
                </h1>
                <div className="flex items-center gap-2 text-neutral-dark/60 font-bold uppercase tracking-widest text-sm">
                  <Icons.MapPin className="w-4 h-4 text-primary" />
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
                      <Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 bg-neutral-dark/5 p-8 rounded-3xl border border-neutral-dark/10">
                <h2 className="text-xs font-black text-neutral-dark uppercase tracking-[0.3em]">Technický popis a průběh</h2>
                <div className="prose prose-sm text-neutral-dark/70 font-medium leading-relaxed">
                  <p>
                    Tato <strong>realizace sanace</strong> byla provedena s důrazem na maximální zachování integrity objektu. Celý proces zahrnoval diagnostiku vlhkosti, přípravu pracoviště a samotné <strong>strojní podřezávání zdiva</strong> nebo aplikaci chemické bariéry.
                  </p>
                  <p>
                    Při práci využíváme výhradně profesionální vybavení a certifikované materiály s ověřenou životností. Každý krok realizace je pečlivě kontrolován, aby byl výsledek trvalý a plně funkční. Tímto přístupem vracíme zdraví vaší stavbě a chráníme ji před další degradací způsobenou vzlínající vlhkostí.
                  </p>
                </div>
              </div>

              {/* Detailed SEO Content Block */}
              <div className="space-y-8 pt-8">
                <h2 className="text-2xl font-black text-neutral-dark uppercase tracking-tight italic">Časté otázky k sanaci v lokalitě {project.location}</h2>
                <div className="grid gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-3">Jak dlouho vydrží ochrana proti vlhkosti?</h3>
                    <p className="text-neutral-dark/70 text-sm leading-relaxed">
                      Při použití mechanického podřezání s vložením PE fólie nebo nerezových plechů je životnost izolace prakticky shodná s životností celé stavby. Jedná se o definitivní řešení, které fyzicky oddělí zdivo od vlhkého podloží. Vracíme zdraví vaší stavbě s jistotou na desítky let.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-3">Je tato metoda vhodná pro každý typ zdiva?</h3>
                    <p className="text-neutral-dark/70 text-sm leading-relaxed">
                      Díky kombinaci technologií (řetězová pila pro cihlu, diamantové lano pro kámen, chemická injektáž pro členité části) jsme schopni vyřešit vlhkost u jakéhokoliv objektu v lokalitě {project.location} a okolí. Každý projekt začíná odborným posouzením přímo na místě.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-3">Omezí sanace provoz v domě?</h3>
                    <p className="text-neutral-dark/70 text-sm leading-relaxed">
                      Většina prací probíhá z vnější strany objektu, což minimalizuje zásahy do interiéru. Technologie diamantového lana je navíc bezprašná díky vodnímu chlazení. Po dokončení prací a tlakovém vyplnění spár je objekt okamžitě staticky zajištěn a připraven k dalšímu užívání.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-neutral-dark/5">
                <h2 className="text-xl font-black text-neutral-dark uppercase tracking-tight italic">Regionální působnost a materiály</h2>
                <div className="prose prose-sm text-neutral-dark/70 font-medium leading-relaxed">
                  <p>
                    Ačkoliv se tato konkrétní realizace nachází v lokalitě <strong>{project.location}</strong>, naše firma IZODIAMANT poskytuje profesionální služby v oblasti <strong>sanace vlhkého zdiva</strong> po celé České republice. Specializujeme se na náročné projekty, kde je vyžadována maximální preciznost a použití nejmodernějších technologií, jako je právě <strong>podřezávání diamantovým lanem</strong> nebo řetězovou pilou.
                  </p>
                  <p>
                    Kromě lokality {project.location} pravidelně realizujeme zakázky ve městech jako jsou <strong>Pardubice, Chrudim, Hradec Králové, Ústí nad Orlicí, Vysoké Mýto, Litomyšl, Polička, Svitavy</strong> a mnoho dalších. Naše technika nám umožňuje pracovat s různými typy materiálů – od klasické pálené cihly přes smíšené zdivo až po extrémně tvrdý pískovec či opuku, které jsou pro východočeský region typické.
                  </p>
                  <p>
                    Každá stavba má svá specifika a vyžaduje individuální přístup k řešení <strong>hydroizolace</strong>. Naším cílem není pouze dočasné zakrytí problému, ale jeho systémové odstranění, kterým vracíme zdraví vaší stavbě a zvyšujeme její tržní hodnotu i energetickou efektivitu.
                  </p>
                </div>
              </div>

              {/* Linked Review Section */}
              {project.reviewId && (
                <ProjectReview reviewId={project.reviewId} />
              )}
            </div>

            <div className="sticky top-32 space-y-8">
              <ProjectGallery 
                images={project.gallery && project.gallery.length > 0 ? project.gallery : [project.image]} 
                title={project.title} 
              />
              
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

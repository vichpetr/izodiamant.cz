import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Icons } from "@/components/Icons";
import referencesData from "@/data/references.json";
import regionsData from "@/data/regions.json";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    path: "/kde-pusobime",
    title: "Kde působíme – sanace zdiva po celé ČR",
    description:
      "Sanaci a podřezání vlhkého zdiva provádíme po celé České republice. Sídlíme v Nových Hradech, nejvíc zakázek máme ve východních Čechách. Přehled realizací podle lokality.",
  }),
  keywords: [
    "sanace zdiva po celé ČR",
    "podřezání zdiva východní Čechy",
    "sanace vlhkého zdiva Pardubický kraj",
    "podřezání zdiva Praha",
    "sanace zdiva Brno",
    "Nové Hrady",
  ],
};

/** Realizace seřazené podle lokality – tabulka „kde jsme skutečně pracovali“. */
const projectsByLocation = [...referencesData].sort((a, b) =>
  a.location.localeCompare(b.location, "cs"),
);

export default function AreasPage() {
  const breadcrumb = breadcrumbSchema([
    { name: "Domů", path: "/" },
    { name: "Kde působíme", path: "/kde-pusobime" },
  ]);

  return (
    <main className="min-h-screen bg-neutral-light">
      {/* JSON-LD renderujeme jako běžný <script>, aby byl v serverovém HTML i pro crawlery bez JS. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <Header />

      <section className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg text-primary-ink font-black text-xs uppercase tracking-widest mb-6">
            <Icons.MapPin className="w-4 h-4" />
            Oblasti působení
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic leading-[0.95] mb-8">
            Kde sanujeme a <span className="text-primary-ink">podřezáváme vlhké zdivo</span>
          </h1>
          <div className="prose prose-lg max-w-none text-neutral-dark/80">
            <p>
              Sídlíme v Nových Hradech ve východních Čechách a na sanaci vlhkého zdiva vyjíždíme po celé
              České republice. Nejvíc zakázek děláme právě ve východních
              Čechách – prostě proto, že to máme nejblíž – a pravidelně jezdíme i do Prahy, Brna a okolí.
              Prohlídka objektu a zpracování nezávazné cenové nabídky jsou zdarma.
            </p>
            <p>
              Na téhle stránce nenajdete šablonu s názvem každého města v republice. Najdete tu kraje, kam
              jezdíme, a hlavně <strong>konkrétní realizace podle lokality</strong> – u každé je vidět, co jsme
              tam dělali a jakou technologií.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark mb-8">
            Kraje, kam jezdíme
          </h2>
          <ul className="grid sm:grid-cols-2 gap-3">
            {regionsData.regions.map((region) => (
              <li
                key={region}
                className="flex items-center gap-3 bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm font-medium text-neutral-dark/80"
              >
                <Icons.MapPin className="w-4 h-4 text-primary-ink shrink-0" />
                <span>{region}</span>
                {region === regionsData.home && (
                  <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-primary-ink bg-primary/10 px-2 py-1 rounded">
                    Sídlo
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-neutral-dark/70 font-medium mt-6">
            Jinam po republice vyjedeme také – u vzdálenějších zakázek jen předem
            domluvíme termín a podmínky. Výjimkou jsou{" "}
            <Link href="/sluzby/zednicke-a-obkladacske-prace" className="text-primary-ink font-bold hover:underline">
              zednické a obkladačské práce
            </Link>
            , které jako doplňkovou službu děláme zhruba do 60 km od Nových Hradů.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic text-neutral-dark mb-2">
            Realizace podle lokality
          </h2>
          <p className="text-neutral-dark/70 font-medium mb-8">
            {projectsByLocation.length} dokončených zakázek, u kterých si můžete projít fotky i rozsah prací.
          </p>
          <div className="grid gap-3">
            {projectsByLocation.map((project) => (
              <Link
                key={project.id}
                href={`/reference/${project.id}`}
                className="group flex items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all"
              >
                <div>
                  <span className="flex items-center gap-2 font-black uppercase italic text-neutral-dark group-hover:text-primary transition-colors">
                    <Icons.MapPin className="w-4 h-4 text-primary shrink-0" />
                    {project.location}
                  </span>
                  <span className="block text-sm text-neutral-dark/70 font-medium mt-1">
                    {project.technology} · {project.scope}
                  </span>
                </div>
                <Icons.ArrowRight className="w-5 h-5 text-primary shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/reference"
              className="inline-flex items-center gap-2 text-primary-ink font-black uppercase tracking-widest text-xs hover:text-neutral-dark transition-colors group"
            >
              Celý archiv referencí
              <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-neutral-dark rounded-[2.5rem] p-8 md:p-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary opacity-5 -skew-x-12 translate-x-20" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-4">
                Nevíte, jestli k vám dojedeme?
              </h2>
              <p className="text-white/70 font-medium leading-relaxed mb-8 max-w-2xl">
                Napište nám adresu a typ zdiva. Ozveme se s termínem prohlídky a orientační cenou – obojí
                nezávazně a zdarma. Metodu vybíráme podle materiálu:{" "}
                <Link href="/sluzby/diamantove-lano" className="text-primary font-bold hover:underline">
                  diamantové lano
                </Link>{" "}
                na kámen a beton,{" "}
                <Link href="/sluzby/retezova-pila" className="text-primary font-bold hover:underline">
                  řetězová pila
                </Link>{" "}
                na cihlu,{" "}
                <Link href="/sluzby/chemicka-injektaz" className="text-primary font-bold hover:underline">
                  chemická injektáž
                </Link>{" "}
                tam, kde nelze řezat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/#calculator"
                  className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center gap-3"
                >
                  Spočítat cenu
                  <Icons.Calculator className="w-5 h-5" />
                </Link>
                <Link
                  href="/#contact"
                  className="py-4 px-8 uppercase tracking-widest font-black text-xs border border-white/20 rounded-lg hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-3"
                >
                  Napsat nám
                  <Icons.ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

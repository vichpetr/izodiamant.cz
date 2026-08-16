import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "ztracene-bedneni";
const TITLE = "Ztracené bednění: kdy a proč ho použít";
const DESC = "Co je ztracené bednění, kdy se hodí na základy a opěrné stěny a jak souvisí s hydroizolací proti vzlínající vlhkosti. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["ztracené bednění","ztracené bednění základy","opěrná stěna ztracené bednění","betonové tvárnice bednění","základová stěna bednění"],
};

const SERVICES = [
  { href: "/sluzby/zednicke-a-obkladacske-prace", label: "Zednické a obkladačské práce", note: "Betonáž, obklady, dlažba i drobné stavební práce." },
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "Řezání betonu a základů bez otřesů." },
  { href: "/sluzby/chemicka-injektaz", label: "Chemická injektáž", note: "Dodatečná hydroizolace proti vzlínající vlhkosti." },
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      title={TITLE}
      description={DESC}
      published="2027-01-03"
      intro={<><strong className="text-neutral-dark">Ztracené bednění</strong> je systém betonových tvárnic, které se skladují nasucho, vyztuží a zalijí betonem, přičemž samy zůstávají trvalou součástí konstrukce. Nabízí rychlý způsob, jak vytvořit únosné a přímé stěny základů, suterénů i opěrných zdí.</>}
    >
      <H2>Co je ztracené bednění</H2>
      <P>Tvárnice ztraceného bednění se kladou na sraz do vazby, obvykle bez malty, a vytvoří dutou stěnu. Do dutin se osadí svislá i vodorovná výztuž podle projektu a celá stěna se zalije betonem.</P>
      <P>Na rozdíl od klasického bednění se tvárnice po zatvrdnutí betonu neodstraňují, ale zůstávají zabudované. Vznikne tak masivní betonová stěna s pravidelným lícem.</P>

      <H2>Kdy se hodí</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Základové a suterénní stěny.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Opěrné a zárubní zdi ve svahu.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Oplocovací a podezdívkové zdi.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Stabilizace svahů a terénních zlomů.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Menší nosné stěny vyžadující rychlou a přímou realizaci.</span></li>
      </ul>

      <H2>Výhody systému</H2>
      <P>Hlavní předností je rychlost. Skládání tvárnic je jednoduché a přehledné, což urychluje výstavbu oproti sestavování a odbedňování klasického bednění.</P>
      <P>Zalitá a vyztužená stěna má vysokou únosnost a udrží přímé linie. To se hodí zejména u opěrných zdí, kde stěna přenáší tlak zeminy.</P>

      <H2>Na co si dát pozor</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Únosné a zhutněné podloží a řádně provedený základ pod stěnou.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Výztuž uložená podle projektu, svislá i vodorovná.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Ukládání betonu po vrstvách a jeho důkladné zhutnění bez dutin.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Kontrola svislosti a přímosti stěny během betonáže.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>U opěrných zdí vyřešené odvodnění a odvedení vody od stěny.</span></li>
      </ul>

      <H2>Ztracené bednění a vlhkost</H2>
      <P>U základových a suterénních stěn je stěna trvale v kontaktu se zeminou a zemní vlhkostí. Samotný beton tvárnic není náhradou za hydroizolaci, proto se svislá i vodorovná izolace navrhuje jako součást konstrukce.</P>
      <P>Bez spolehlivé hydroizolace vlhkost postupně vzlíná do navazujícího zdiva a projeví se na omítkách i ve vnitřním prostředí. Vhodně řešené odvodnění a spojitá izolace jsou proto stejně důležité jako samotná pevnost stěny.</P>

      <H2>Kdy zvážit odborné posouzení</H2>
      <P>Volba mezi ztraceným bedněním a jiným řešením závisí na výšce stěny, zatížení a základových poměrech. U vyšších opěrných zdí a stěn zatížených tlakem zeminy je namístě statické posouzení.</P>
      <P>Pokud řešíte novou opěrnou nebo základovou stěnu a zároveň chcete předejít pozdějším problémům s vlhkostí, doporučujeme začít prohlídkou na místě a nezávaznou kalkulací rozsahu prací.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "pokladka-obkladu";
const TITLE = "Pokládka obkladů a dlažby: příprava podkladu";
const DESC = "Proč o kvalitě obkladů a dlažby rozhoduje podklad – rovinnost, penetrace, hydroizolace a suché zdivo. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["pokládka obkladů","pokládka dlažby","příprava podkladu pod dlažbu","hydroizolace pod obklady","podklad pod dlažbu"],
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
      published="2026-12-27"
      intro={<>O výsledku obkladačských prací rozhoduje z velké části to, co není vidět, tedy <strong className="text-neutral-dark">podklad</strong>. Sebelepší lepidlo ani drahá dlažba nezachrání pokládku na podklad, který je nerovný, nesoudržný nebo prosáklý vlhkostí.</>}
    >
      <H2>Požadavky na podklad</H2>
      <P>Podklad pod obklady a dlažbu musí být rovný, pevný a soudržný. Odlupující se stará malba, prach nebo zbytky lepidla brání spojení a obklad se časem uvolní.</P>
      <P>Důležitá je také zralost a suchost podkladu. Nové omítky a potěry potřebují čas na vyzrání a vyschnutí, jinak zbytková vlhkost narušuje lepení i spárování.</P>

      <H2>Penetrace a příprava povrchu</H2>
      <P>Před pokládkou se savý podklad ošetří penetrací, která sjednotí nasákavost a zlepší přilnavost lepidla. U hladkých a málo savých povrchů se naopak volí přípravky pro zvýšení přídržnosti.</P>
      <P>Větší nerovnosti je vhodné vyrovnat stěrkou nebo samonivelační hmotou. Rovný podklad usnadní pokládku a omezí riziko dutin pod dlaždicemi.</P>

      <H2>Hydroizolační stěrka ve vlhkých provozech</H2>
      <P>V koupelnách, sprchách a dalších vlhkých provozech patří pod obklady hydroizolační stěrka. Nanáší se před lepením dlaždic a chrání konstrukci před vlhkostí, která obkladem a spárami postupně proniká.</P>
      <P>Zvláštní pozornost si zaslouží kouty, rohy a prostupy potrubí, kde se používají těsnicí pásy a manžety. Právě tato místa bývají nejčastějším zdrojem pozdějších problémů.</P>

      <H2>Lepidlo, spárování a dilatace</H2>
      <P>Lepidlo se volí podle druhu dlaždic, formátu a prostředí, u velkých formátů a exteriéru jsou nároky vyšší. Nanáší se celoplošně tak, aby pod dlaždicí nezůstávaly dutiny.</P>
      <P>Spáry a dilatační spáry nejsou detail navíc, ale nutnost. Umožňují konstrukci reagovat na teplotní a vlhkostní změny, a proto se pružné spáry řeší v koutech, u prostupů a na napojení různých materiálů.</P>

      <H2>Kroky přípravy podkladu</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Očištění podkladu od prachu, mastnoty a nesoudržných vrstev.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Kontrola rovinnosti a pevnosti, vyrovnání stěrkou podle potřeby.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Ověření zralosti a suchosti nových omítek a potěrů.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Penetrace podle nasákavosti podkladu.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Hydroizolační stěrka a těsnicí pásy ve vlhkých provozech a koutech.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Volba vhodného lepidla a spárovací hmoty podle formátu a prostředí.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Návrh dilatačních a pružných spár v rizikových místech.</span></li>
      </ul>

      <H2>Pozor na vlhký a zasolený podklad</H2>
      <P>Pokládka na vlhký nebo zasolený podklad se dříve či později projeví. Obklady se odlepují, spáry plesniví a na povrchu se mohou objevit výkvěty solí.</P>
      <P>Pokud je zdivo prosáklé vzlínající vlhkostí, nestačí ho jen povrchově přetáhnout stěrkou, protože příčina zůstane uvnitř konstrukce. V takovém případě patří na řadu nejdříve sanace, tedy odstranění příčiny podřezáním nebo chemickou injektáží a doplnění hydroizolace, a teprve poté obkladačské práce. Zda jde o vzlínající vlhkost, nejlépe ukáže prohlídka na místě.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

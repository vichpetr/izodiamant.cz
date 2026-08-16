import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "bile-vykvety-salpetr";
const TITLE = "Bílé výkvěty (salpetr) na zdivu";
const DESC = "Co jsou bílé výkvěty solí (salpetr) na zdivu, proč vznikají a jak se jich trvale zbavit. Souvisí se vzlínající vlhkostí. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["bílé výkvěty na zdivu","salpetr","solné výkvěty","výkvěty solí zdivo","jak odstranit salpetr","soli ve zdivu"],
};

const SERVICES = [
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "Kámen, beton i silné zdivo bez limitu tloušťky." },
  { href: "/sluzby/retezova-pila", label: "Řetězová pila", note: "Cihelné zdivo s pravidelnou ložnou spárou." },
  { href: "/sluzby/chemicka-injektaz", label: "Chemická injektáž", note: "Tam, kde nelze mechanicky řezat." },
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      title={TITLE}
      description={DESC}
      published="2026-09-20"
      intro={<>Bílé práškovité nebo krystalické skvrny na omítce a zdivu bývají <strong className="text-neutral-dark">solné výkvěty</strong>, lidově salpetr. Nejde o kosmetickou vadu, ale o viditelný příznak zvýšené vlhkosti ve zdivu. Dokud trvá přísun vlhkosti, výkvěty se po každém oškrábání vracejí.</>}
    >
      <H2>Co jsou bílé výkvěty na zdivu</H2>
      <P>Bílé výkvěty jsou vodorozpustné soli, které se nashromáždily na povrchu zdiva a omítky. Nejčastěji jde o dusičnany, sírany a uhličitany, které pocházejí z podloží, ze stavebního materiálu nebo z okolní půdy.</P>
      <P>Soli se do zdiva dostávají rozpuštěné ve vodě. Když voda na povrchu odpaří, soli zůstanou a vykrystalizují do podoby bílého povlaku nebo jehličkovitých krystalů. Proto se výkvěty objevují právě tam, kam vlhkost dosáhne a kde se odpařuje.</P>

      <H2>Proč solné výkvěty vznikají</H2>
      <P>Příčinou je vzlínající vlhkost. Voda z podloží stoupá kapilárami ve zdivu vzhůru a s sebou nese rozpuštěné soli. U povrchu se voda odpaří a soli se ukládají v pórech omítky i cihel.</P>
      <P>Množství výkvětů kolísá podle ročního období a vlhkosti vzduchu. Ve vytápěné místnosti nebo v suchém období bývají výraznější, protože rychlejší odpar přivádí k povrchu více solí. To ale neznamená, že vlhkost zmizela, jen se přesunulo místo, kde voda opouští zdivo.</P>

      <H2>Čím výkvěty škodí</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Krystalizace solí zvětšuje objem a mechanicky rozrušuje omítku, která praská, boulí se a odpadává.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Soli jsou hygroskopické, poutají vzdušnou vlhkost a udržují zeď trvale vlhkou.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Poškozený povrch nedrží nátěry ani novou omítku, dokud se příčina neodstraní.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Vlhké a zasolené zdivo hůře izoluje teplo a vytváří podmínky pro plíseň.</span></li>
      </ul>

      <H2>Proč samotné oškrábání nestačí</H2>
      <P>Oškrábání výkvětů, otření nebo přetření sanačním nátěrem odstraní jen to, co je vidět. Zásoba solí zůstává hluboko ve zdivu a vlhkost jich stále přináší další. Během několika týdnů či měsíců se výkvěty objeví znovu, často silněji.</P>
      <P>Výkvěty je proto potřeba chápat jako symptom, ne jako příčinu. Trvalé řešení nespočívá v čištění povrchu, ale v přerušení přísunu vlhkosti, která soli do zdiva vynáší.</P>

      <H2>Jak se salpetru zbavit trvale</H2>
      <P>Základem je přerušit vzlínající vlhkost. Podle materiálu a tloušťky zdiva se vytvoří vodorovná hydroizolační bariéra mechanickým podřezáním, nebo se tam, kde řezat nelze, provede chemická injektáž. Tím se zastaví transport vody i solí ze spodních vrstev.</P>
      <P>Po přerušení vlhkosti se otlučou zasolené omítky až na zdravé zdivo a nahodí se sanační omítky. Ty mají hrubou pórovitou strukturu, do níž se zbytkové soli ukládají, aniž by narušovaly povrch, a umožňují zdivu postupně přirozeně vyschnout. Doplňkem bývá pravidelné větrání, které odvádí vlhkost z prostoru.</P>

      <H2>Jak poznat rozsah a začít</H2>
      <P>Rozsah zasolení a vlhkosti není z povrchu vždy patrný, proto se před sanací zdivo posoudí přímo na místě. Podle typu zdiva se volí vhodná metoda přerušení vlhkosti a rozsah výměny omítek.</P>
      <P>Nezávazná prohlídka a kalkulace jsou zdarma. Orientační cenu podle metody a rozsahu si můžete spočítat v naší online kalkulačce.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "jak-vysusit-vlhky-sklep";
const TITLE = "Jak vysušit vlhký sklep a udržet ho suchý";
const DESC = "Jak se trvale zbavit vlhkosti ve sklepě – od odstranění vzlínající vlhkosti po větrání a sanační omítky. Řešení místo zakrývání. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["jak vysušit vlhký sklep","vlhký sklep řešení","odvlhčení sklepa","suchý sklep","vlhkost ve sklepě"],
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
      published="2026-11-15"
      intro={<>Vlhký sklep se nedá vyřešit odvlhčovačem ani přetřením plísně, dokud trvá příčina. Klíčem je zjistit, odkud vlhkost přichází, a <strong className="text-neutral-dark">odstranit ji u zdroje</strong> – teprve pak zdivo přirozeně vyschne a zůstane suché.</>}
    >
      <H2>Nejdřív zjistěte příčinu vlhkosti</H2>
      <P>Než sáhnete po jakémkoli řešení, je nutné rozlišit, o jaký typ vlhkosti jde. Ve sklepě se nejčastěji potkáte se třemi příčinami a každá se řeší jinak.</P>
      <P>Vzlínající zemní vlhkost stoupá zdivem vzhůru z podloží – poznáte ji podle mokrého pásu při podlaze, opadávající omítky a bílých výkvětů solí. Zatékání vody se projevuje spíš lokálně po dešti nebo tání, u vstupů, prostupů a špatně odvedených okapů. Kondenzace vzniká, když teplý vlhký vzduch dosedne na studené zdivo – typicky v létě a bez souvislosti s podlahou.</P>

      <H2>Odstraňte příčinu, ne jen následek</H2>
      <P>U vzlínající zemní vlhkosti je řešením přerušení vzlínání dodatečnou vodorovnou bariérou. Ve zdivu z cihel se provádí strojní podřezání řetězovou pilou, u kamenného, betonového nebo velmi silného zdiva diamantovým lanem a tam, kde řezat nelze, chemická injektáž. Bariéra zastaví přísun vody a zdivo nad ní začne postupně vysychat.</P>
      <P>U zatékání je potřeba odvést vodu od stavby – spravit okapy a svody, upravit spád terénu, případně zřídit drenáž kolem základů. U kondenzace pomůže zateplení, úprava povrchů a hlavně správný režim větrání. Bez odstranění příčiny zůstává jakékoli další opatření jen dočasnou náplastí.</P>

      <H2>Otlučte zasolené omítky a nahoďte sanační</H2>
      <P>Omítka nasáklá vodou a solemi už svou funkci neplní a znovu by vlhla. Zasolenou omítku je proto nutné otlouct, obvykle do výšky zhruba půl až jeden metr nad viditelné poškození, a nechat zdivo provětrat.</P>
      <P>Na obnažené zdivo se nanáší sanační omítka. Ta je záměrně pórovitá, umožňuje odpar vlhkosti a ukládá krystalizující soli ve své struktuře, aniž by se drolila. Díky tomu zůstává povrch suchý na omak i v době, kdy zdivo ještě dosychá.</P>

      <H2>Větrejte správně – kdy a jak</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>V létě větrejte spíš ráno nebo v noci, kdy je venkovní vzduch chladnější. Teplý vlhký letní vzduch ve studeném sklepě zkondenzuje a vlhkost naopak přidá.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>V zimě a v přechodných obdobích je studený venkovní vzduch sušší, proto krátké intenzivní vyvětrání sklepu prospívá.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Větrejte krátce a naplno (průvan) místo trvale pootevřeného okénka – zbytečně tím jen ochlazujete zdivo.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Pomůže i jednoduchý vlhkoměr: větrejte, jen když je venku sušší vzduch než uvnitř.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Nebraňte proudění vzduchu – neskládejte věci natěsno ke stěnám a nechte zdivu prostor dýchat.</span></li>
      </ul>

      <H2>Proč odvlhčovač ani nátěr proti plísni nestačí</H2>
      <P>Odvlhčovač snižuje vlhkost vzduchu, ale nedokáže zastavit vodu, která do zdiva neustále přichází z podloží nebo zvenčí. Jakmile ho vypnete, vlhkost se vrátí. Podobně nátěr proti plísni jen skryje projev na povrchu, zatímco příčina uvnitř zdiva zůstává.</P>
      <P>Tato opatření mají smysl až jako doplněk – poté, co je příčina odstraněná a zdivo vysušené. Samotná se stávají trvalým, opakujícím se nákladem bez skutečného výsledku.</P>

      <H2>Udržovací režim, aby sklep zůstal suchý</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Pravidelně kontrolujte okapy, svody a spád terénu, aby se voda nevracela ke stavbě.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Držte se sezónního režimu větrání a případně si veďte jednoduchý přehled vlhkosti.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Sledujte první signály – vlhký pás u podlahy, výkvěty solí, zatuchlý pach – a reagujte hned.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Nezakrývejte sanační omítku parotěsnými nátěry ani obklady, které by bránily odparu.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Při nejistotě si nechte stav zdiva posoudit odborně; prohlídka a kalkulace jsou zdarma.</span></li>
      </ul>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

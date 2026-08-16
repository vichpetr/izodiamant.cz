import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "plisen-na-zdech";
const TITLE = "Plíseň na zdech: příčiny a trvalé řešení";
const DESC = "Proč vzniká plíseň na zdech, čím je nebezpečná a jak ji odstranit natrvalo – ne jen zakrýt. Klíčem je příčina vlhkosti. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["plíseň na zdech","plíseň v bytě","jak odstranit plíseň","plíseň ze zdi","černá plíseň zdivo","plíseň a vlhkost"],
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
      published="2026-09-27"
      intro={<>Černé nebo zelenavé skvrny v rozích místností, za nábytkem a kolem oken nejsou jen estetický problém. <strong className="text-neutral-dark">Plíseň</strong> je mikroorganismus, který roste všude, kde je dost vlhkosti, a signalizuje, že se stavbou nebo užíváním prostoru není něco v pořádku. Klíčem k trvalému řešení je najít zdroj vlhkosti.</>}
    >
      <H2>Proč plíseň na zdech vzniká</H2>
      <P>Plíseň potřebuje k růstu tři věci: vlhkost, živiny a vhodnou teplotu. Živiny najde téměř na každém povrchu, v prachu i v omítce, a teplota v obytných místnostech jí vyhovuje. Rozhodujícím a jediným ovlivnitelným faktorem je proto vlhkost.</P>
      <P>U plísně na zdech rozlišujeme dvě hlavní příčiny vlhkosti. První je kondenzace, tedy srážení vzdušné vlhkosti na chladných a nedostatečně větraných plochách. Druhou je vzlínající vlhkost, která stoupá zdivem od základů. Podle toho, o kterou příčinu jde, se liší i správné řešení.</P>

      <H2>Kondenzace, nebo vzlínající vlhkost</H2>
      <P>Kondenzační plíseň se typicky objevuje v horních rozích místností, za skříněmi u vnějších stěn a kolem okenních rámů, tedy v místech tepelných mostů a špatného proudění vzduchu. Souvisí s vysokou vlhkostí v interiéru, nedostatečným větráním a chladnými povrchy.</P>
      <P>Vzlínající vlhkost naopak postihuje spodní část stěn, pás při podlaze, sokly a suterény. Bývá provázená opadávající omítkou a solnými výkvěty. Určení správné příčiny je zásadní, protože řešení kondenzace vzlínající vlhkost nevyřeší a naopak.</P>

      <H2>Zdravotní rizika plísně</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Plísně uvolňují do vzduchu spory, které se snadno vdechují.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Mohou spouštět a zhoršovat alergie a projevovat se rýmou, kašlem či podrážděnýma očima.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>U citlivých osob a astmatiků zhoršují dýchací potíže.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Dlouhodobý pobyt ve zaplísněném prostředí zatěžuje imunitní i dýchací systém, nejvíce u dětí a seniorů.</span></li>
      </ul>

      <H2>Proč fungicidní nátěr nestačí</H2>
      <P>Přetření plesnivé plochy fungicidním přípravkem odstraní viditelný porost, ale neřeší jeho příčinu. Dokud zůstává povrch vlhký, plíseň se během několika týdnů vrátí na stejné místo.</P>
      <P>Chemické ošetření má smysl jako první krok, který zlikviduje stávající porost. Trvalý účinek ale přijde teprve tehdy, když se odstraní zdroj vlhkosti, díky němuž plíseň roste.</P>

      <H2>Trvalé řešení podle příčiny</H2>
      <P>U kondenzační plísně je cílem snížit vlhkost vzduchu a zajistit, aby povrchy nebyly chladné. Pomáhá pravidelné a intenzivní větrání, vytápění bez velkých teplotních výkyvů, odsun nábytku od vnějších stěn a odstranění tepelných mostů. To vše je v rukou majitele nebo se řeší úpravou konstrukce.</P>
      <P>U vzlínající vlhkosti je nutná sanace zdiva. Přeruší se přísun vody vytvořením vodorovné hydroizolační bariéry mechanickým podřezáním, nebo chemickou injektáží tam, kde řezat nelze. Poté se vymění zasolené omítky za sanační a zdivo postupně přirozeně vyschne. Bez odstranění vlhkosti u zdroje je jakýkoli zásah do povrchu jen dočasný.</P>

      <H2>Jak zjistit příčinu a začít</H2>
      <P>Podle umístění a rozsahu plísně lze odhadnout, zda jde o kondenzaci, nebo o vzlínající vlhkost, spolehlivé určení ale patří do rukou odborníka přímo na místě. Podle příčiny se pak volí správný postup, aby se plíseň nevracela.</P>
      <P>Pokud za plísní stojí vlhké zdivo, nezávazná prohlídka a kalkulace jsou zdarma. Orientační cenu sanace podle metody a rozsahu si můžete spočítat v naší online kalkulačce.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

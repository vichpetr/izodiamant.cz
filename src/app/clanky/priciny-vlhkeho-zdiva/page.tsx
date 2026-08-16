import type { Metadata } from "next";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "priciny-vlhkeho-zdiva";
const TITLE = "5 nejčastějších příčin vlhkého zdiva";
const DESC = "Pět nejčastějších příčin vlhkého zdiva – od vzlínající vlhkosti po zatékání a kondenzaci – a jak je od sebe rozeznat. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["příčiny vlhkého zdiva","proč je zdivo vlhké","vlhké zdivo příčiny","odkud se bere vlhkost ve zdi","zdroje vlhkosti v domě"],
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
      published="2026-10-11"
      intro={<>Vlhké zdivo nemá jeden univerzální důvod. Za mapami, opadávající omítkou a plísní stojí několik různých <strong className="text-neutral-dark">příčin vlhkého zdiva</strong> a často se i kombinují. Podle toho, odkud se voda bere, se liší i správné řešení.</>}
    >
      <H2>1. Vzlínající zemní vlhkost</H2>
      <P>Nejčastější příčina u starších domů. Chybí nebo dosloužila vodorovná hydroizolace, a voda z podloží proto stoupá kapilárami vzhůru. Pozná se podle vlhkého pásu od podlahy zhruba do výšky 0,5 až 1,5 metru, solných výkvětů a bublajícího soklu.</P>
      <P>Řešením je obnovit vodorovnou bariéru. U cihelného zdiva s pravidelnou ložnou spárou se používá řetězová pila, u kamene, betonu a silného či smíšeného zdiva diamantové lano s vodním chlazením a bez otřesů. Do proříznuté spáry se vloží hydroizolace, zajistí klíny a spára se tlakově vyplní cementovou směsí. Tam, kde nelze mechanicky řezat, nastupuje chemická injektáž.</P>

      <H2>2. Zatékání srážkové vody</H2>
      <P>Voda se do zdiva dostává zvenčí přes poškozené okapy a svody, chybějící nebo netěsné oplechování, popraskanou fasádu nebo terén navršený nad úroveň podlahy. Vlhká mapa nekopíruje pás u podlahy, ale vede od místa, kudy voda vniká, a stav se zhoršuje po deštích a tání.</P>
      <P>Řeší se odstraněním zdroje: opravou svodů a oplechování, úpravou okolního terénu tak, aby voda odtékala od domu, a opravou fasády. Bez odvedení srážkové vody by jakákoli další sanace neměla dlouhého trvání.</P>

      <H2>3. Kondenzace vzdušné vlhkosti</H2>
      <P>Vlhkost se sráží na chladném povrchu tam, kam dopadá teplý vlhký vzduch z místnosti. Typicky se objevuje v koutech, za nábytkem, u stropu a v místě tepelných mostů, zhoršuje se v topné sezoně a při nedostatečném větrání. Na rozdíl od vzlínání není vázaná na pás u podlahy.</P>
      <P>Řešením je pravidelné a účinné větrání, odstranění tepelných mostů a doplnění zateplení. Kondenzace není voda z konstrukce, takže se neřeší podřezáním, ale úpravou vlhkostního režimu a povrchových teplot v místnosti.</P>

      <H2>4. Poškozená hydroizolace a prosakující rozvody</H2>
      <P>Vlhkost může pocházet i z lokální poruchy: prasklé svislé izolace spodní stavby, netěsného vodovodního nebo kanalizačního potrubí ve zdi či v podlaze. Taková vlhkost bývá soustředěná do jednoho místa a nemusí odpovídat žádnému z běžných vzorců.</P>
      <P>Nejprve je nutné najít a opravit samotný únik, jinak se problém vrací. Po odstranění zdroje a vyschnutí konstrukce se řeší poškozené omítky a povrchy. U svislé izolace spodní stavby jde často o zásah zvenčí odkopem a novou izolací.</P>

      <H2>5. Zasolení zdiva</H2>
      <P>Dlouhodobě vlhké zdivo se postupně zasoluje. Soli z podloží i z původních stavebních materiálů se odparem koncentrují u povrchu, jsou hygroskopické, takže samy vážou vzdušnou vlhkost a udržují zeď vlhkou i po odstranění hlavní příčiny. Poznáte je podle bílých výkvětů a drolící se omítky.</P>
      <P>Zasolení se řeší odstraněním kontaminovaných omítek a nanesením sanačních omítek, které umí ukládat soli ve své struktuře a nechají zdivo dýchat. Samotná sanační omítka ale příčinu neodstraní, je to navazující krok po obnově izolace.</P>

      <H2>Jak postupovat dál</H2>
      <P>Jednotlivé příčiny se často prolínají, proto se vyplatí začít správnou diagnózou a teprve podle ní volit opatření. U kondenzace a zatékání jde hlavně o větrání, zateplení a odvedení vody, u poruch izolace o jejich opravu.</P>
      <P>Pokud je za vlhkostí vzlínající zemní voda, je řešením obnova vodorovné bariéry mechanickým podřezáním nebo chemickou injektáží s navazujícími sanačními omítkami. Orientační cenu si spočítáte v naší online kalkulačce, nezávaznou prohlídku a kalkulaci nabízíme zdarma.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

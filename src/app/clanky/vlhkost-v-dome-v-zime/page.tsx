import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "vlhkost-v-dome-v-zime";
const TITLE = "Vlhkost v domě v zimě: kondenzace a plíseň";
const DESC = "Proč se v zimě objevuje vlhkost, kondenzace a plíseň a jak odlišit kondenzaci od vzlínající vlhkosti ve zdivu. Prevence i řešení. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["vlhkost v domě v zimě","kondenzace na zdech","plíseň v zimě","rosení oken plíseň","zimní vlhkost v bytě"],
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
      published="2026-12-13"
      intro={<>V zimě si mnoho domácností poprvé všimne orosených oken, vlhkých koutů a plísně v rozích. Nejčastější příčinou je <strong className="text-neutral-dark">kondenzace</strong> teplého vlhkého vzduchu na chladných površích, kterou zhoršuje omezené větrání v topné sezoně. Ne vždy ale jde o zimní kondenzaci: pokud vlhkost stoupá od podlahy a trápí vás celoročně, příčina je jiná a řešení také.</>}
    >
      <H2>Proč se vlhkost a plíseň objeví hlavně v zimě</H2>
      <P>Teplý vzduch v interiéru pojme víc vodní páry než vzduch studený. Když se v zimě dostane k chladnému povrchu, ochladí se a přebytečná vlhkost se na něm srazí v podobě kapek. Přesně to vidíte na orosených oknech.</P>
      <P>V topné sezoně navíc větráme méně a kratší dobu, abychom neztráceli teplo. Vlhkost z vaření, sušení prádla, sprchování i dýchání se tak hromadí uvnitř a nemá kudy odejít. Kombinace vlhkého vzduchu a studených ploch je ideální prostředí pro vznik plísně.</P>

      <H2>Kde kondenzace vzniká nejčastěji</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Na sklech a v ostění oken, což bývá první viditelný signál.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>V rozích obvodových stěn a v koutech u stropu, kde se sbíhají chladné plochy.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Na tepelných mostech, například u překladů, věnců a špatně zateplených detailů.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Za nábytkem přisunutým těsně ke studené obvodové stěně, kde vzduch necirkuluje.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>V málo vytápěných a málo větraných místnostech, jako jsou ložnice a spíže.</span></li>
      </ul>

      <H2>Kondenzační vlhkost versus vzlínající vlhkost</H2>
      <P>Rozlišit tyto dva problémy je klíčové, protože se řeší úplně jinak. Kondenzační vlhkost přichází shora a z povrchu: usazuje se na chladných plochách, na oknech, v horních rozích a za nábytkem, a nejvíc se projevuje v zimě a po vlhkých činnostech.</P>
      <P>Vzlínající vlhkost naopak přichází zdola, ze základů a podzákladí, a stoupá zdivem vzhůru. Poznáte ji podle toho, že mapy, oprýskaná omítka a solné výkvěty začínají u podlahy a pás vlhkosti sahá zhruba do výšky jednoho metru. Na rozdíl od kondenzace vás trápí celoročně, v létě i v zimě. Pokud problém pokračuje od podlahy a nezávisí na ročním období, nejde o kondenzaci.</P>

      <H2>Jak kondenzaci a plísni předcházet</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Větrejte krátce a intenzivně: několikrát denně naplno otevřít okna na pár minut je účinnější a šetrnější než trvale pootevřená ventilačka.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Rovnoměrně vytápějte i méně užívané místnosti, aby povrchy stěn nebyly studené.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Odvětrávejte kuchyni a koupelnu při vaření a sprchování, ideálně ventilátorem nebo otevřeným oknem.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Odsuňte nábytek několik centimetrů od obvodových stěn, aby za ním mohl proudit vzduch.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Sušte prádlo pokud možno mimo obytné místnosti nebo při zajištěném odvětrání.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Sledujte vlhkost vzduchu vlhkoměrem; v obytných prostorech se obvykle doporučuje držet ji přibližně mezi 40 a 60 procenty.</span></li>
      </ul>

      <H2>Kdy už větrání nestačí</H2>
      <P>Pokud jste upravili větrání i vytápění a plíseň se přesto vrací, nebo pokud vlhkost jednoznačně stoupá od podlahy a trvá po celý rok, nejde o zimní kondenzaci. Taková vlhkost má příčinu ve zdivu a samotnou změnou návyků ji neodstraníte.</P>
      <P>V tom případě je namístě řešit příčinu. Vzlínání přerušíme přímo ve zdivu, podle materiálu řetězovou pilou u cihelného zdiva, diamantovým lanem u kamene a betonu, nebo chemickou injektáží tam, kde řezat nelze. Na to navazují sanační omítky a úprava větrání.</P>

      <H2>Nejste si jistí příčinou? Přijedeme změřit</H2>
      <P>Rozlišit kondenzaci a vzlínající vlhkost na dálku nelze, proto vlhkost změříme přímo u vás a řekneme vám, odkud pochází. Podle toho navrhneme buď úpravu větrání a vytápění, nebo sanaci zdiva.</P>
      <P>Prohlídku i kalkulaci nabízíme zdarma a nezávazně, abyste neinvestovali do řešení, které míří vedle skutečné příčiny.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

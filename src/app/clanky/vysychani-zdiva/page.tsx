import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "vysychani-zdiva";
const TITLE = "Jak dlouho zdivo vysychá po podřezání";
const DESC = "Jak dlouho trvá vysychání zdiva po podřezání, na čem to závisí a jak proces podpořit sanační omítkou a větráním. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["vysychání zdiva","jak dlouho schne zdivo","zdivo po podřezání","doba vysychání zdiva","kdy omítat po podřezání"],
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
      published="2026-11-29"
      intro={<>Po podřezání nebo injektáži často padá otázka, kdy bude zdivo suché. Přerušení <strong className="text-neutral-dark">vzlínající vlhkosti</strong> je zásadní krok, ale voda ze stěny nezmizí okamžitě. Zdivo nad novou bariérou vysychá postupně a přirozeně, což může trvat týdny až měsíce.</>}
    >
      <H2>Proč vysychání trvá</H2>
      <P>Podřezání ani injektáž zdivo aktivně nevysuší. Vytvoří vodorovnou bariéru, která přeruší přísun vody vzlínající z podloží, takže do stěny nad bariérou už další vlhkost nepřichází.</P>
      <P>Voda, která ve zdivu zůstala, se pak musí odpařit skrz povrch. To je pomalý přirozený proces, jehož rychlost závisí na tloušťce stěny, materiálu i podmínkách v okolí.</P>

      <H2>Jak dlouho zdivo schne</H2>
      <P>Orientačním vodítkem je přibližně 1 cm tloušťky zdiva za měsíc. U tenčí příčky tak jde o týdny, u běžné obvodové stěny o řadu měsíců.</P>
      <P>U silného historického zdiva, kamenných nebo smíšených stěn se doba vysychání běžně počítá na mnoho měsíců, u velmi mohutných konstrukcí i okolo roku. Jde o odhad, konkrétní stěna se může chovat jinak.</P>

      <H2>Na čem doba vysychání závisí</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tloušťka stěny: čím silnější zdivo, tím delší cesta pro odpaření vody.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Materiál a nasákavost: plná cihla, kámen a smíšené zdivo drží vlhkost déle než lehčí materiály.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Míra zasolení: soli ve zdivu vážou vlhkost a zpomalují vysychání, protože nasávají vodu ze vzduchu.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Teplota a vytápění: teplejší stěna se odpařuje rychleji.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Větrání: odvádění vlhkého vzduchu z místnosti proces výrazně urychluje.</span></li>
      </ul>

      <H2>Jak vysychání podpořit</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Pravidelně a krátce, ale intenzivně větrat, aby vlhký vzduch odcházel ven.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Prostor temperovat a nenechávat ho dlouhodobě vychladlý.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Otlučenou zasolenou omítku nahradit sanační omítkou, která pomáhá odvádět vlhkost i zvládat soli.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Povrch neuzavírat nepropustnými nátěry, obklady ani nábytkem těsně u stěny.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Počítat s tím, že jde o přirozené vysychání po odstranění příčiny, ne o umělé vysoušení přístroji.</span></li>
      </ul>

      <H2>Kdy má smysl finální omítky</H2>
      <P>Se sanační omítkou lze začít poměrně brzy po zásahu, protože je k probíhajícímu vysychání přímo určená a pomáhá mu.</P>
      <P>S finálními, málo prodyšnými povrchovými úpravami, hladkými štuky pod disperzní barvu nebo parotěsnými obklady, je lepší počkat, dokud zdivo dostatečně nevyschne. Uzavřením ještě vlhké stěny hrozí, že se vlhkost a soli projeví znovu.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

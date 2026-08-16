import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "skryta-vlhkost-pred-koupi";
const TITLE = "Kupujete starší dům? Pozor na skrytou vlhkost";
const DESC = "Jak před koupí staršího domu odhalit skrytou vlhkost zdiva – čeho si všímat, kde měřit a co může znamenat čerstvá omítka. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["skrytá vlhkost dům","koupě staršího domu vlhkost","jak poznat vlhkost před koupí","vlhké zdivo starý dům","prohlídka domu vlhkost"],
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
      published="2026-12-06"
      intro={<>Starší dům může na první pohled působit bezvadně, přesto se v jeho zdivu často skrývá <strong className="text-neutral-dark">vzlínající vlhkost</strong>, kterou prodávající před prohlídkou zamaskuje čerstvým nátěrem nebo novou omítkou. Vlhké zdivo přitom není kosmetická vada, ale závada, jejíž odstranění může stát desítky až stovky tisíc korun. Následující kontrolní seznam vám pomůže poznat varovné signály ještě před koupí.</>}
    >
      <H2>Proč se skrytou vlhkostí zabývat před koupí</H2>
      <P>Vlhkost ve zdivu se do ceny nemovitosti obvykle nepromítne, dokud ji sami neodhalíte. Prodávající o ní buď neví, nebo ji vědomě zakrývá, protože kupující ji při běžné prohlídce snadno přehlédne.</P>
      <P>Rozdíl mezi vlhkým a suchým domem přitom může znamenat velkou položku v rozpočtu na rekonstrukci. Sanace vlhkého zdiva, výměna omítek a odstranění následných škod na podlahách a dřevěných prvcích se počítají v desítkách až stovkách tisíc korun. Proto se vyplatí věnovat prohlídce pozornost a vzít si s sebou tento seznam.</P>

      <H2>Čeho si při prohlídce všímat</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tmavší mapy a stopy u soklů a při patě stěn, zejména v přízemí a ve sklepě.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Bílé výkvěty solí na omítce nebo na zdivu, často v pásu do výšky asi jednoho metru nad podlahou.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Plíseň v rozích místností, v koutech, za nábytkem a v místech se špatným větráním.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Zatuchlý, sklepní pach, který nezmizí ani po vyvětrání.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Odchlíplé podlahové lišty, boulící se tapety a odlupující se malba nebo omítka u podlahy.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Zvlněné nebo nadzvednuté plovoucí podlahy a poškozené dřevěné prahy.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Vlhký, studený sklep se stopami po vodě na stěnách i podlaze.</span></li>
      </ul>

      <H2>Varovné signály zakrývání závady</H2>
      <P>Nejvíc pozorní buďte tam, kde je něco nápadně nové jen v části domu. Čerstvá omítka nebo nový obklad pouze do výšky zhruba jednoho metru nad podlahou bývá pokusem překrýt pás vzlínající vlhkosti a solných výkvětů.</P>
      <P>Podezřelý je i čerstvý nátěr sklepa těsně před prodejem, přemalované partie jen u podlahy nebo nový nábytek postavený těsně ke stěně, který zakrývá právě ta místa, kde se vlhkost projevuje. Pokud prodávající tyto úpravy nedokáže vysvětlit, ptejte se dál.</P>

      <H2>Kde a čím měřit</H2>
      <P>Levný příložný vlhkoměr vám napoví, kde je zdivo vlhčí než okolí. Měřte na více místech: u paty stěn, ve výšce zhruba metru, v rozích, ve sklepě a pro srovnání i na stěnách, které vypadají suché. Zajímají vás hlavně rozdíly mezi jednotlivými místy.</P>
      <P>Orientační měření vám ale neřekne, jestli jde o vzlínající vlhkost ze základů, o zatékání, nebo o kondenzaci. Skutečnou příčinu a rozsah spolehlivě určí až odborník s profesionálním přístrojem a zkušeností s posuzováním zdiva.</P>

      <H2>Co znamená vzlínající vlhkost pro budoucí náklady</H2>
      <P>Vzlínající vlhkost stoupá z podzákladí kapilárami ve zdivu vzhůru a projevuje se celoročně, typicky od podlahy nahoru. Sama od sebe nezmizí a novou malbou ani omítkou se nevyřeší, protože příčina zůstává.</P>
      <P>Trvale ji odstraníme přerušením vzlínání přímo ve zdivu. Podle materiálu volíme řetězovou pilu u cihelného zdiva, diamantové lano u kamene, betonu a silných konstrukcí, nebo chemickou injektáž tam, kde řezat nelze. Na podřezání navazují sanační omítky a správné větrání. S touto informací můžete o ceně nemovitosti dál jednat, nebo od koupě ustoupit.</P>

      <H2>Nechte si dům prohlédnout ještě před koupí</H2>
      <P>Prohlídku a orientační měření vlhkosti staršího domu pro vás rádi provedeme ještě před podpisem smlouvy. Řekneme vám, zda jde o vzlínající vlhkost, jaký má rozsah a jaká metoda sanace připadá v úvahu.</P>
      <P>Nezávaznou prohlídku i kalkulaci nabízíme zdarma, takže do jednání o koupi půjdete s reálnou představou o stavu zdiva i o nákladech, které vás mohou čekat.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

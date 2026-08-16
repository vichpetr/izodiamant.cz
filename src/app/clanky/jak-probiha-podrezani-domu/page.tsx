import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "jak-probiha-podrezani-domu";
const TITLE = "Jak probíhá podřezání domu krok za krokem";
const DESC = "Celý postup podřezání domu – od zaměření přes řez a vložení izolace po zajištění statiky a sanační omítky. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["jak probíhá podřezání domu","podřezání zdiva postup","podřezání domu krok za krokem","dodatečná izolace zdiva","vodorovná izolace zdiva"],
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
      published="2026-10-18"
      intro={<>Vzlínající vlhkost ve zdivu má obvykle jednu příčinu – chybějící nebo poškozenou vodorovnou izolaci. <strong className="text-neutral-dark">Dodatečná vodorovná izolace zdiva</strong> ji nahradí přímo v konstrukci. Následující přehled ukazuje, jak podřezání domu probíhá krok za krokem a co od jednotlivých fází čekat.</>}
    >
      <H2>1. Prohlídka, měření vlhkosti a zaměření</H2>
      <P>Vše začíná obhlídkou stavby na místě. Změříme vlhkost zdiva, posoudíme materiál a tloušťku stěn, stav omítek a míru zasolení. Podle toho se rozhodne, jestli je vhodná řetězová pila, diamantové lano, nebo chemická injektáž tam, kde mechanicky řezat nelze.</P>
      <P>Prohlídka a kalkulace jsou zdarma. Výstupem je návrh metody a rozsahu prací i orientační cena – tu si můžete předběžně spočítat i v kalkulačce na webu.</P>

      <H2>2. Příprava a osazení techniky</H2>
      <P>Před řezáním připravíme pracovní prostor a osadíme techniku podle zvolené metody. U diamantového lana i řetězové pily jde o vodní chlazení, které drží nízkou prašnost a chrání nástroj i zdivo.</P>
      <P>Práce se vedou v úsecích tak, aby konstrukce zůstala staticky zajištěná po celou dobu. Nikdy se neproříznou všechny stěny najednou.</P>

      <H2>3. Proříznutí vodorovné spáry</H2>
      <P>V úrovni nad terénem se prořízne vodorovná spára po celém obvodu řešeného zdiva. U cihelného zdiva s pravidelnou ložnou spárou je efektivní řetězová pila. U kamene, betonu, smíšeného nebo velmi silného zdiva nastupuje diamantové lano, které řeže bez omezení tloušťky a bez otřesů.</P>
      <P>Řez postupuje po dílčích úsecích. Každý úsek se dokončí a zajistí dřív, než se pokračuje dál.</P>

      <H2>4. Vložení hydroizolace do spáry</H2>
      <P>Do prořízlé spáry se vloží hydroizolace, která tvoří novou vodorovnou bariéru proti vzlínající vlhkosti. Tím se přeruší cesta, kudy voda putovala zeminou do zdiva.</P>
      <P>Izolace se osazuje tak, aby na sebe jednotlivé pásy navazovaly a bariéra byla souvislá po celém řezaném úseku.</P>

      <H2>5. Statické zajištění a tlakové vyplnění spáry</H2>
      <P>Do spáry se vkládají klíny, které přenesou zatížení stěny a udrží ji ve stabilní poloze. Zbývající prostor se tlakově vyplní cementovou směsí.</P>
      <P>Tím se řez znovu uzavře, zdivo dosedne na novou vrstvu a statika zůstává zachovaná. Po vytvrdnutí je stěna opět plně nosná.</P>

      <H2>6. Navazující práce a vysychání</H2>
      <P>Po podřezání přichází na řadu sanace povrchů. Zasolené a poškozené omítky se otlučou a nahradí sanačními omítkami, které umožňují zdivu odvětrávat a odolávají solím. Důležité je i dostatečné větrání prostor.</P>
      <P>Zdivo pak postupně vysychá – jak dlouho, závisí na tloušťce a míře původního zavlhčení, obvykle jde o týdny až měsíce. Vlhkost řešíme odstraněním příčiny, ne vysoušecími přístroji.</P>

      <H2>Jak dlouho to trvá a dá se během prací bydlet</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Doba prací závisí na délce a tloušťce zdiva – u běžného rodinného domu jde často o několik dní.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Řez s vodním chlazením je čistý a málo prašný, bez otřesů, které by ohrozily konstrukci.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>V domě lze zpravidla dál bydlet, práce probíhají po úsecích a zvenčí i zevnitř podle přístupu.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Statická stabilita stěny je zajištěná v každé fázi, nikdy není narušená celá stěna najednou.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Finální sanační omítky a vysychání navazují postupně po dokončení podřezání.</span></li>
      </ul>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

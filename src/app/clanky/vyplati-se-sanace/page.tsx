import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "vyplati-se-sanace";
const TITLE = "Vyplatí se sanace vlhkého zdiva?";
const DESC = "Návratnost sanace vlhkého zdiva a rizika odkládání – od statiky a plísní po účty za vytápění a hodnotu nemovitosti. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["vyplatí se sanace zdiva","návratnost sanace","rizika vlhkého zdiva","důsledky vlhkosti v domě","proč řešit vlhké zdivo"],
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
      published="2026-11-08"
      intro={<>Otázka <strong className="text-neutral-dark">vyplatí se sanace vlhkého zdiva</strong> stojí v jádru správně: nejde o výdaj sám o sobě, ale o srovnání dvou cest. Na jedné straně jsou náklady na řešení, na druhé rostoucí škody, které vlhkost napáchá, pokud se nechá být. V tomto článku střízlivě rozebíráme, co odkládání dlouhodobě stojí a proč má odstranění příčiny smysl.</>}
    >
      <H2>Co vlhkost ve zdivu dlouhodobě způsobí</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Rozpad omítek a vydrolování malty ve spárách, opadávající barvy a boule pod nátěry.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Postupná degradace zdiva a v pokročilé fázi i oslabení jeho nosnosti a statiky.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Koroze kovových prvků ve zdivu, jako jsou kotvy, výztuž nebo ocelové překlady.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Plísně a mikroorganismy na stěnách, které zhoršují kvalitu vnitřního prostředí.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Horší tepelně izolační schopnost vlhkého zdiva, a tím vyšší náklady na vytápění.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Vlhký, zatuchlý vzduch, který snižuje komfort bydlení a využitelnost prostor.</span></li>
      </ul>

      <H2>Rizika se sčítají, náklady rostou</H2>
      <P>Vlhkost nestojí na místě. Vzlínající voda putuje zdivem stále výš a s sebou nese soli, které krystalizují a rozrušují omítky i strukturu zdiva. Čím déle proces běží, tím větší plochu a hloubku zdiva zasáhne.</P>
      <P>Škody, které by dnes vyřešilo přerušení vlhkosti a nové sanační omítky, se za pár let mohou proměnit v nutnost obnažovat a opravovat základy, řešit poškozené překlady nebo statiku. Odkládání tak zpravidla neušetří, jen přesune vyšší účet do budoucna.</P>

      <H2>Zdraví a hodnota nemovitosti</H2>
      <P>Vlhké a plesnivé stěny nejsou jen kosmetický problém. Vlhké prostředí a plísně mohou zhoršovat kvalitu vzduchu v místnostech, což je zvlášť citlivé u ložnic, dětských pokojů a obytných sklepů.</P>
      <P>Vlhké zdivo se navíc pozná při každé prohlídce nemovitosti a promítá se do její tržní hodnoty. Kupující i odhadci vnímají viditelnou vlhkost jako skrytou zátěž a odhadovanou opravu si do ceny promítnou. Vyřešená vlhkost naopak působí jako doklad o dobré péči o dům.</P>

      <H2>Jednorázová investice proti trvalému odstranění příčiny</H2>
      <P>Klíčový rozdíl je v přístupu. Vysoušení povrchu nebo pouhé přemalování řeší následek a vlhkost se vrací, protože příčina, tedy vzlínání od základů, zůstává. Sanace jde po příčině: vodorovnou izolací přeruší cestu vlhkosti do zdiva.</P>
      <P>Cihelné zdivo přerušíme řetězovou pilou, kámen, beton nebo silné zdivo diamantovým lanem a tam, kde řezat nelze, nastupuje chemická injektáž. Doplní je sanační omítky a dobré větrání prostor. Jde o jednorázový zásah, který odstraní zdroj problému, místo aby jej znovu a znovu maskoval.</P>

      <H2>Návratnost: jak o ní uvažovat střízlivě</H2>
      <P>Přesnou návratnost v korunách nelze u sanace poctivě vyčíslit, protože každý dům má jiný rozsah škod i jinou hodnotu. Rozumnější je porovnat řády: náklad na přerušení vlhkosti a sanační omítky proti sumě, kterou by časem spolykaly opakované opravy omítek, vyšší účty za vytápění a hlubší zásahy do konstrukce.</P>
      <P>V tomto srovnání zpravidla vychází dřívější řešení výhodněji než čekání. Investice se navíc neztrácí: promítá se do nižších provozních nákladů, zdravějšího prostředí a udržené hodnoty nemovitosti.</P>

      <H2>Jak začít</H2>
      <P>Prvním krokem je získat představu o rozsahu a orientačních nákladech. Nezávazný odhad ceny za přerušení vlhkosti si spočítáte v naší online kalkulačce po zadání metody, délky zdiva a jeho tloušťky.</P>
      <P>Závaznou nabídku připravíme až po prohlídce na místě, kde posoudíme příčinu vlhkosti, materiál zdiva i rozsah potřebných prací. Prohlídka i kalkulace jsou zdarma.</P>

      <H2>Spočítejte si nezávaznou cenu</H2>
      <P>Orientační cenu si spočítáte během chvíle v naší online kalkulačce; závaznou nabídku zpracujeme po prohlídce objektu.</P>
      <div className="pt-1">
        <Link href="/#calculator" className="btn-primary py-4 px-8 uppercase tracking-widest shadow-xl shadow-primary/20 inline-flex items-center gap-3">
          Spočítat cenu v kalkulačce <Icons.Calculator className="w-5 h-5" />
        </Link>
      </div>
      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

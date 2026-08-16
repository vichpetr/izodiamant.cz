import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "lano-vs-retezova-pila";
const TITLE = "Diamantové lano, nebo řetězová pila?";
const DESC = "Kdy zvolit podřezání diamantovým lanem a kdy řetězovou pilou – podle materiálu, tloušťky a přístupu ke zdivu. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["diamantové lano vs řetězová pila","podřezání zdiva metody","čím podřezat zdivo","řezání kamenného zdiva","podřezání cihelného zdiva"],
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
      published="2026-10-25"
      intro={<>Mechanické podřezání zdiva zvládnou dvě metody – <strong className="text-neutral-dark">řetězová pila</strong> a <strong className="text-neutral-dark">diamantové lano</strong>. Každá se hodí na jiný typ zdiva. Rozdíl není v tom, která je lepší, ale která sedne na konkrétní materiál, tloušťku a přístup na stavbě.</>}
    >
      <H2>Řetězová pila: rychle a ekonomicky na cihlu</H2>
      <P>Řetězová pila řeže podél pravidelné ložné spáry, proto je ideální na cihelné zdivo, kde spáry probíhají v jedné rovině. Práce je rychlá a patří k ekonomicky nejvýhodnějším způsobům podřezání.</P>
      <P>Metoda má své hranice – uplatní se na měkčím, pravidelném zdivu do určité tloušťky. Na tvrdý kámen, beton nebo nepravidelné smíšené zdivo se nehodí.</P>

      <H2>Diamantové lano: kámen, beton i silné zdivo</H2>
      <P>Diamantové lano si poradí i tam, kde pila narazí – řeže kámen, beton, železobeton, smíšené a velmi silné zdivo bez omezení tloušťky. Nepotřebuje pravidelnou spáru, protože si cestu prořeže napříč materiálem.</P>
      <P>Řez běží s vodním chlazením a bez otřesů, které by mohly narušit statiku. Za tuto univerzálnost se platí – lano je nákladnější než pila, zato zvládne konstrukce, které jinak mechanicky rozříznout nejdou.</P>

      <H2>Podle čeho se rozhodnout</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Materiál zdiva: cihla vs. kámen, beton, smíšené zdivo.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tloušťka stěny: pila má limit, lano řeže bez omezení tloušťky.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Pravidelnost spáry: řetězová pila potřebuje rovnou ložnou spáru, lano ne.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Přístup ke stavbě a prostor kolem řezaného úseku.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Cena: pila je ekonomičtější, lano dražší, ale univerzálnější.</span></li>
      </ul>

      <H2>Kdy nastupuje chemická injektáž</H2>
      <P>Ne vždy jde zdivo mechanicky proříznout – brání tomu nesoudržný materiál, špatný přístup nebo konstrukční důvody. V takových případech je řešením chemická injektáž.</P>
      <P>Do zdiva se vrtají otvory, kterými se vpraví injektážní hmota. Ta ve zdivu vytvoří vodorovnou clonu proti vzlínající vlhkosti bez nutnosti řezat. Je to třetí cesta tam, kde pila ani lano nejsou možné.</P>

      <H2>Rozhodnutí padne až na místě</H2>
      <P>Kterou metodu zvolit, se nejlépe pozná při prohlídce. Změříme vlhkost, posoudíme materiál, tloušťku a stav spár a navrhneme postup, který na dané zdivo sedne.</P>
      <P>Prohlídka i kalkulace jsou zdarma, orientační cenu si můžete předběžně spočítat i v kalkulačce na webu. Cílem je odstranit příčinu vlhkosti, ne jen její následky.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

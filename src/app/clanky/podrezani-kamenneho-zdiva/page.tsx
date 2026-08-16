import type { Metadata } from "next";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "podrezani-kamenneho-zdiva";
const TITLE = "Podřezání kamenného zdiva";
const DESC = "Jak se podřezává tvrdé kamenné a smíšené zdivo – diamantovým lanem bez omezení tloušťky, s vodním chlazením a minimem prašnosti. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: `/clanky/${SLUG}`, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["podřezání kamenného zdiva", "sanace kamenného zdiva", "podřezání smíšeného zdiva", "diamantové lano kámen", "izolace kamenného zdiva"],
};

const SERVICES = [
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "Kamenné, betonové i smíšené zdivo bez limitu tloušťky." },
  { href: "/sluzby/retezova-pila", label: "Řetězová pila", note: "Pro cihelné zdivo s pravidelnou ložnou spárou." },
  { href: "/sluzby/chemicka-injektaz", label: "Chemická injektáž", note: "Tam, kde nelze mechanicky řezat." },
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      title={TITLE}
      description={DESC}
      published="2026-08-16"
      intro={<>Kamenné a smíšené zdivo je tvrdé, nepravidelné a často velmi silné – běžná řetězová pila na něj nestačí. Řešením je <strong className="text-neutral-dark">podřezání diamantovým lanem</strong>, které si poradí s jakýmkoli materiálem bez ohledu na tloušťku stěny.</>}
    >
      <H2>Proč právě diamantové lano</H2>
      <P>Diamantové lano prořízne tvrdý kámen, beton i smíšené zdivo, kde se střídá cihla, kámen a malta. Nemá limit tloušťky – zvládne i stěny přes dva metry – a řeže pod stálým chlazením vodou, takže je prašnost minimální a práce možná i v interiéru. Řez je navíc bez otřesů, což chrání statiku a je klíčové u starších a historických staveb.</P>

      <H2>Jak řez probíhá</H2>
      <P>Nejdřív zaměříme objekt a zkontrolujeme materiál a tloušťku zdiva. Osadíme vodicí kladky a agregát, který lano pohání, a zdivo plynule prořízneme ve vodorovné rovině. Do vzniklé spáry průběžně vkládáme hydroizolaci, zdivo staticky zajistíme klíny a spáru tlakově vyplníme cementovou směsí – únosnost zůstává po celou dobu zachovaná.</P>

      <H2>Kamenné i smíšené zdivo</H2>
      <P>Výhodou lana je, že zvládne různou tvrdost materiálů v jednom řezu. U smíšeného zdiva (kámen + cihla) proto nemusíme kombinovat metody a vytvoříme souvislou bariéru po celé délce. Vzlínající vlhkost se přeruší a zdivo nad izolací začne přirozeně vysychat.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

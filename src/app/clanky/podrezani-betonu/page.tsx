import type { Metadata } from "next";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";

const SLUG = "podrezani-betonu";
const TITLE = "Podřezání betonu a základů";
const DESC = "Řezání betonu a železobetonových základů diamantovým lanem – čistě, bez otřesů a bez omezení tvrdosti či tloušťky konstrukce. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: `/clanky/${SLUG}`, title: TITLE, description: DESC }),
  keywords: ["podřezání betonu", "řezání betonu", "řezání železobetonu", "podřezání základů", "diamantové lano beton"],
};

const SERVICES = [
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "Beton, železobeton, kámen – bez limitu tloušťky." },
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
      intro={<>Beton a železobeton patří k nejpevnějším konstrukcím, na které při sanaci narazíte. Mechanicky je spolehlivě prořízne jen <strong className="text-neutral-dark">diamantové lano</strong> – bez ohledu na tvrdost i tloušťku.</>}
    >
      <H2>Proč diamantové lano na beton</H2>
      <P>Diamantové lano si poradí s prostým betonem, železobetonem i tvrdým pískovcem a opukou. Nemá limit tloušťky a řeže pod vodním chlazením, takže je řez čistý a prakticky bezprašný – zvládneme ho i v interiéru nebo v omezeném prostoru, kde by se s jinou technikou pracovalo těžko. Řezání je navíc bez vibrací, takže nehrozí narušení okolní konstrukce.</P>

      <H2>Typické situace</H2>
      <P>Nejčastěji betonové konstrukce podřezáváme kvůli přerušení vzlínající vlhkosti u betonových soklů a základů, dále při dělení základových desek nebo opěrných stěn. Řez vedeme přesně v požadované rovině – u dodatečné izolace obvykle podle laseru.</P>

      <H2>Vložení izolace a statika</H2>
      <P>Do proříznuté spáry vkládáme hydroizolaci, konstrukci staticky zajistíme klíny a spáru tlakově vyplníme cementovou směsí. Únosnost tak zůstává zachovaná a vzlínající vlhkost je přerušená souvislou bariérou.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

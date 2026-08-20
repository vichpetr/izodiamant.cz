import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "cena-sanace-vlhkeho-zdiva";
const TITLE = "Cena sanace zdiva: z čeho se skládá";
const DESC = "Z čeho se skládá cena sanace vlhkého zdiva a co ji ovlivňuje – metoda, materiál, tloušťka i navazující omítky. Orientační sazby za m². Nejsme plátci DPH.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["cena sanace vlhkého zdiva","sanace zdiva cena","cena izolace zdiva","kolik stojí sanace zdiva","ceník sanace zdiva"],
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
      published="2026-11-01"
      intro={<>Když se řekne <strong className="text-neutral-dark">cena sanace vlhkého zdiva</strong>, mnoho lidí si představí jen sazbu za jeden metr řezu. Skutečný rozpočet je ale širší: k samotnému přerušení vzlínající vlhkosti patří i navazující práce a řada faktorů, které konečnou částku posouvají. V tomto článku rozkládáme cenu na jednotlivé položky, abyste věděli, za co platíte a proč.</>}
    >
      <H2>1. Samotné přerušení vlhkosti: podřezání nebo injektáž</H2>
      <P>Jádrem každé sanace je vytvoření vodorovné izolace, která přeruší vzlínající vlhkost od základů. Podle materiálu a přístupnosti zdiva se volí metoda a od ní se odvíjí základní sazba.</P>
      <P>Řetězovou pilou řežeme cihelné zdivo, diamantovým lanem kámen, beton a silné či smíšené zdivo bez omezení tloušťky. Tam, kde řezat nelze, nastupuje chemická injektáž. Řetězová pila a chemická injektáž jsou od 2 500 Kč/m², diamantové lano od 4 500 Kč/m².</P>
      <P>Uvedené sazby platí za metr čtvereční řezné plochy, tedy za délku podřezávaného úseku vynásobenou tloušťkou zdiva; u silnějšího zdiva je řezná plocha větší a cena úměrně roste. Nejsme plátci DPH, ceny jsou tedy konečné.</P>

      <H2>2. Navazující práce, které k sanaci patří</H2>
      <P>Přerušit vlhkost je první krok. Zdivo, které roky vlhlo, je zpravidla prosycené solemi a nasáklá omítka drží vlhkost dál. Proto k rozpočtu patří i práce, které vrátí stěnu do suchého a funkčního stavu.</P>
      <P>Typicky jde o otlučení zasolených omítek do potřebné výšky, aplikaci sanačních omítek, které umožňují zdivu odvětrávat a odolávají solím, a závěrečný úklid a likvidaci suti. Rozsah těchto prací se liší dům od domu a tvoří nezanedbatelnou část celkové ceny.</P>

      <H2>3. Faktory, které cenu posouvají nahoru i dolů</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Zvolená metoda: řetězová pila, diamantové lano nebo chemická injektáž mají odlišné sazby.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Materiál a tvrdost zdiva: cihla, kámen, beton nebo smíšené zdivo kladou různý odpor.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tloušťka zdiva: vstupuje přímo do řezné plochy, u silnější stěny cena úměrně roste.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Délka podřezávaného zdiva: čím delší úsek, tím větší řezná plocha i celková částka.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Přístupnost: stísněné prostory, sklepy nebo nutnost obnažit základy práci prodlužují.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Míra zasolení a rozsah poškozených omítek: určuje objem navazujících sanačních prací.</span></li>
      </ul>

      <H2>Co je metr čtvereční řezné plochy</H2>
      <P>Metr čtvereční v našem ceníku není plocha stěny, ale plocha vodorovného řezu, který zdivem vedeme. Spočítá se jako délka podřezávaného úseku vynásobená tloušťkou zdiva: u 10 m dlouhé stěny silné 45 cm jde o 4,5 m², u stejně dlouhé stěny silné 90 cm o 9 m².</P>
      <P>Výška stěny do ceny přerušení vlhkosti nevstupuje – řez i injektážní vrty vedou vodorovným pruhem u paty zdiva. Rozhoduje délka tohoto pruhu a tloušťka zdiva, kterou je nutné přerušit, a právě jejich součin je řezná plocha. U navazujících sanačních omítek se naopak počítá plocha stěny, kterou se omítá – jde tedy o jiné m² než v ceníku podřezání.</P>

      <H2>Jak zjistit orientační a jak závaznou cenu</H2>
      <P>Nezávazný odhad si spočítáte během chvíle v naší online kalkulačce: zadáte metodu, délku zdiva a tloušťku, kalkulačka z nich odvodí řeznou plochu v m² a získáte představu o řádu nákladů na přerušení vlhkosti.</P>
      <P>Závaznou nabídku dáváme až po prohlídce na místě. Teprve tam se dá spolehlivě posoudit materiál a tvrdost zdiva, přístupnost, míra zasolení a rozsah navazujících prací, tedy vše, co online odhad z principu nevidí. Prohlídka i kalkulace jsou zdarma.</P>

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

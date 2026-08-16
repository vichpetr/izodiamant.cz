import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "cena-sanace-vlhkeho-zdiva";
const TITLE = "Cena sanace zdiva: z čeho se skládá";
const DESC = "Z čeho se skládá cena sanace vlhkého zdiva a co ji ovlivňuje – metoda, materiál, tloušťka i navazující omítky. Orientační sazby za bm. Nejsme plátci DPH.";

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
      <P>Řetězovou pilou řežeme cihelné zdivo, diamantovým lanem kámen, beton a silné či smíšené zdivo bez omezení tloušťky. Tam, kde řezat nelze, nastupuje chemická injektáž. Řetězová pila a chemická injektáž jsou od 2 500 Kč/bm, diamantové lano od 4 500 Kč/bm.</P>
      <P>Uvedené sazby platí za běžný metr (bm) při tloušťce zdiva 45 cm; u silnějšího zdiva cena úměrně roste. Nejsme plátci DPH, ceny jsou tedy konečné.</P>

      <H2>2. Navazující práce, které k sanaci patří</H2>
      <P>Přerušit vlhkost je první krok. Zdivo, které roky vlhlo, je zpravidla prosycené solemi a nasáklá omítka drží vlhkost dál. Proto k rozpočtu patří i práce, které vrátí stěnu do suchého a funkčního stavu.</P>
      <P>Typicky jde o otlučení zasolených omítek do potřebné výšky, aplikaci sanačních omítek, které umožňují zdivu odvětrávat a odolávají solím, a závěrečný úklid a likvidaci suti. Rozsah těchto prací se liší dům od domu a tvoří nezanedbatelnou část celkové ceny.</P>

      <H2>3. Faktory, které cenu posouvají nahoru i dolů</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Zvolená metoda: řetězová pila, diamantové lano nebo chemická injektáž mají odlišné sazby.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Materiál a tvrdost zdiva: cihla, kámen, beton nebo smíšené zdivo kladou různý odpor.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tloušťka zdiva: sazby platí pro 45 cm, u silnějšího zdiva cena úměrně roste.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Délka podřezávaného zdiva v běžných metrech: čím delší úsek, tím vyšší celková částka.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Přístupnost: stísněné prostory, sklepy nebo nutnost obnažit základy práci prodlužují.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Míra zasolení a rozsah poškozených omítek: určuje objem navazujících sanačních prací.</span></li>
      </ul>

      <H2>Proč se počítá za běžný metr, a ne za metr čtvereční</H2>
      <P>Vodorovná izolace se zakládá po délce zdi v jedné rovině, ne po ploše stěny. Řez nebo injektážní vrty vedou vodorovným pruhem u paty zdiva, takže rozhodující je délka tohoto pruhu v běžných metrech (bm) a tloušťka zdiva, kterou je nutné přerušit.</P>
      <P>Výška stěny na cenu přerušení vlhkosti nemá vliv, proto by výpočet za metr čtvereční plochy nedával smysl. Metr čtvereční se uplatní až u navazujících omítek, které se skutečně nanášejí na plochu.</P>

      <H2>Jak zjistit orientační a jak závaznou cenu</H2>
      <P>Nezávazný odhad si spočítáte během chvíle v naší online kalkulačce: zadáte metodu, délku zdiva v bm a tloušťku a získáte představu o řádu nákladů na přerušení vlhkosti.</P>
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

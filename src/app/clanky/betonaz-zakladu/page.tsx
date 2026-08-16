import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "betonaz-zakladu";
const TITLE = "Betonáž základů a desek: na co si dát pozor";
const DESC = "Na co si dát pozor při betonáži základů a desek – od podkladu a výztuže po hydroizolaci proti vzlínající vlhkosti. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["betonáž základů","betonování základů","základová deska","hydroizolace základů","betonáž na co pozor"],
};

const SERVICES = [
  { href: "/sluzby/zednicke-a-obkladacske-prace", label: "Zednické a obkladačské práce", note: "Betonáž, obklady, dlažba i drobné stavební práce." },
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "Řezání betonu a základů bez otřesů." },
  { href: "/sluzby/chemicka-injektaz", label: "Chemická injektáž", note: "Dodatečná hydroizolace proti vzlínající vlhkosti." },
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      title={TITLE}
      description={DESC}
      published="2026-12-20"
      intro={<>Základ přenáší zatížení celé stavby do podloží, a proto se chyby z etapy zakládání promítají do konstrukce po celou dobu její životnosti. Kvalitní <strong className="text-neutral-dark">betonáž základů a desek</strong> stojí na správně připraveném podloží, dodržené hloubce založení, spolehlivé výztuži a hlavně na účinné hydroizolaci proti zemní vlhkosti.</>}
    >
      <H2>Podloží a hloubka založení</H2>
      <P>Základ je jen tak dobrý jako podloží, na kterém stojí. Rostlá zemina musí být únosná a rovnoměrná, násypy je nutné zhutnit po vrstvách. Nezhutněné nebo nestejnorodé podloží vede k nerovnoměrnému sedání a k trhlinám ve zdivu.</P>
      <P>Základová spára musí být v nezámrzné hloubce, v podmínkách České republiky se běžně počítá zhruba s 0,8 až 1,2 metru podle lokality a typu zeminy. Menší hloubka vystavuje základ působení mrazu a objemovým změnám podloží.</P>

      <H2>Bednění, výztuž a krytí</H2>
      <P>Bednění musí být rozměrově přesné, tuhé a dostatečně podepřené, aby čerstvý beton neroztlačilo. U základových pasů a desek se vyplatí zkontrolovat rovinnost a svislost před betonáží, opravy po zatvrdnutí jsou pracné.</P>
      <P>Výztuž se ukládá podle projektu a musí mít po celém obvodu dostatečné krytí betonem, které ji chrání před korozí. Distanční podložky zajistí, že prut nezůstane u povrchu nebo přímo na podkladu.</P>

      <H2>Třída betonu a ošetřování</H2>
      <P>Třídu betonu a jeho vlastnosti volte podle projektu a prostředí, nižší třída u nosné konstrukce se nevyplácí. Beton je potřeba při ukládání zhutnit, aby v něm nezůstaly dutiny a hnízda.</P>
      <P>Čerstvý beton potřebuje ošetřování, tedy vlhčení a ochranu povrchu v prvních dnech tuhnutí. Předčasné vyschnutí i betonáž za mrazu zhoršují výslednou pevnost a mohou způsobit trhliny.</P>

      <H2>Hydroizolace proti zemní vlhkosti</H2>
      <P>Základová konstrukce je v trvalém kontaktu se zeminou, a proto potřebuje spolehlivou hydroizolaci proti zemní vlhkosti a vodě. Bez ní vlhkost později vzlíná do zdiva, poškozuje omítky a snižuje tepelnou pohodu.</P>
      <P>Hydroizolační vrstvu je nutné navrhnout a provést jako spojitou, s pečlivě řešenými spoji, prostupy a napojením na svislou izolaci. Právě detaily rozhodují o tom, zda izolace funguje jako celek.</P>

      <H2>Na co si dát pozor</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Únosné a řádně zhutněné podloží, u násypů zhutnění po vrstvách.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Základová spára v nezámrzné hloubce podle lokality a zeminy.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tuhé, přesně sestavené bednění zkontrolované před betonáží.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Výztuž dle projektu s dostatečným krytím a distančními podložkami.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Třída betonu podle projektu a důkladné zhutnění při ukládání.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Ošetřování betonu vlhčením, ochrana před mrazem a rychlým vysušením.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Spojitá hydroizolace proti zemní vlhkosti s dořešenými prostupy a spoji.</span></li>
      </ul>

      <H2>Stávající stavby a dodatečná úprava</H2>
      <P>U stávajících objektů, kde chybí nebo selhala hydroizolace, nemusí znamenat řešení bourání celé konstrukce. Beton a železobeton dokážeme řezat diamantovým lanem bez otřesů, které by ohrozily okolní zdivo.</P>
      <P>Na takto připravenou spáru je možné doplnit dodatečnou hydroizolaci, případně kombinovat s chemickou injektáží zdiva. Rozsah a postup vždy vychází z konkrétního stavu stavby, proto doporučujeme začít prohlídkou a nezávaznou kalkulací.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

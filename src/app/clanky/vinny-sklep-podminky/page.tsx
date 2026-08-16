import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "vinny-sklep-podminky";
const TITLE = "Vinný sklep: jaké podmínky potřebuje";
const DESC = "Jaká teplota, vlhkost a větrání dělá dobrý vinný sklep – a proč je základem suché a zdravé zdivo bez plísně. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["vinný sklep podmínky","teplota vinný sklep","vlhkost vinný sklep","jak založit vinný sklep","archivace vína sklep"],
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
      published="2026-11-22"
      intro={<>Kvalitní archivace vína stojí na stabilním prostředí: vyrovnané teplotě, přiměřené vlhkosti vzduchu, tmě a klidu. Tou nejdůležitější podmínkou, na kterou se zapomíná, je ale <strong className="text-neutral-dark">zdravé suché zdivo</strong> bez vzlínající vlhkosti a plísně.</>}
    >
      <H2>Stabilní teplota kolem 10–14 °C</H2>
      <P>Pro víno není rozhodující ani tak konkrétní hodnota jako stálost teploty. Orientačně se vinný sklep drží v rozmezí zhruba 10 až 14 °C, přičemž nejvíc škodí prudké a časté výkyvy.</P>
      <P>Kolísání teploty urychluje stárnutí vína a namáhá zátky. Proto se sklep zakládá tam, kde teplota přirozeně kolísá co nejméně – níže pod terénem, mimo dosah topení i letního přehřívání.</P>

      <H2>Vlhkost vzduchu okolo 70 %</H2>
      <P>Ve vinném sklepě jde o řízenou vlhkost vzduchu, orientačně kolem 70 %. Taková vlhkost udržuje korkové zátky pružné a těsnící, takže víno nevysychá a přes zátku se neztrácí.</P>
      <P>Příliš suchý vzduch zátky vysušuje a otevírá cestu vzduchu k vínu. Naopak trvale vyšší vlhkost podporuje plíseň na etiketách, zátkách i vybavení sklepa. Cílem je proto rovnováha, ne maximum.</P>

      <H2>Tma, klid a mírné větrání</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Tma: světlo, hlavně sluneční, víno poškozuje, proto sklep udržujte zatemněný a svěťte jen krátce.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Klid bez vibrací: otřesy ruší usazování vína, sklep umísťujte mimo zdroje trvalého chvění.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Mírné větrání: lehká výměna vzduchu brání zatuchlině, ale nesmí rozkolísat teplotu a vlhkost.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Bez cizích pachů: sklep nepoužívejte ke skladování aromatických látek, barev či paliv – víno pachy přijímá.</span></li>
      </ul>

      <H2>Základ všeho: zdravé suché zdivo</H2>
      <P>Řízená vlhkost vzduchu okolo 70 % je něco úplně jiného než vlhkost vzlínající z mokrého zdiva. Prosáklé stěny do prostoru trvale odpařují vodu, vlhkost tím nekontrolovaně roste a přináší plíseň, výkvěty solí i zatuchlý pach.</P>
      <P>Takové prostředí škodí vínu i samotné stavbě a běžnými prostředky sklepního režimu se udržet nedá. Zdravé, suché zdivo je proto předpokladem, bez kterého ostatní podmínky nikdy nedáte spolehlivě dohromady.</P>

      <H2>Když je zdivo mokré, nejdřív sanace</H2>
      <P>Pokud stěny vlhnou a plesniví, je namístě nejprve odstranit příčinu vlhkosti. U vzlínající zemní vlhkosti se přeruší dodatečnou vodorovnou bariérou – podřezáním řetězovou pilou u cihelného zdiva, diamantovým lanem u kamene a silných stěn, nebo chemickou injektáží tam, kde řezat nelze.</P>
      <P>Po odstranění příčiny se otlučou zasolené omítky a nahodí sanační, které umožní zdivu vysychat. Teprve na takto ozdraveném základu má smysl ladit teplotu, vlhkost a větrání do podoby vhodné pro archivaci vína.</P>

      <H2>Jak podmínky prakticky udržet</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Sledujte teplotu a vlhkost jednoduchým teploměrem s vlhkoměrem a reagujte na výkyvy.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Větrejte krátce a citlivě – tak, abyste nerozhodili stabilní prostředí sklepa.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Udržujte tmu a klid, sklep neproměňujte ve skladiště pachově výrazných věcí.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Kontrolujte zdivo: vlhký pás, výkvěty solí nebo plíseň jsou signál k řešení příčiny.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Při zakládání nebo obnově sklepa si nechte stav zdiva posoudit; prohlídka a kalkulace jsou zdarma.</span></li>
      </ul>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

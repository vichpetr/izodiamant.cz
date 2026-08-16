import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";

const SLUG = "podrezani-nebo-injektaz";
const TITLE = "Podřezání zdiva, nebo chemická injektáž?";
const DESC = "Kdy zvolit mechanické podřezání a kdy chemickou injektáž? Srovnání podle spolehlivosti, materiálu i přístupu ke zdivu. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: `/clanky/${SLUG}`, title: TITLE, description: DESC }),
  keywords: ["podřezání nebo injektáž", "chemická injektáž vs podřezání", "sanace vlhkého zdiva metoda", "vzlínající vlhkost řešení"],
};

const SERVICES = [
  { href: "/sluzby/retezova-pila", label: "Řetězová pila", note: "Rychlé podřezání cihelného zdiva s pravidelnou spárou." },
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "Kamenné, betonové i smíšené zdivo bez limitu tloušťky." },
  { href: "/sluzby/chemicka-injektaz", label: "Chemická injektáž", note: "Tam, kde nelze mechanicky řezat." },
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      title={TITLE}
      description={DESC}
      published="2026-08-16"
      intro={<>Obě metody řeší stejný problém – <strong className="text-neutral-dark">vzlínající zemní vlhkost</strong> – ale úplně jiným principem. Která je pro vaši stavbu vhodnější? Rozhoduje hlavně to, jestli jde zdivo mechanicky proříznout.</>}
    >
      <H2>Mechanické podřezání (řetězová pila, diamantové lano)</H2>
      <P>Při podřezání se zdivo fyzicky prořízne ve vodorovné spáře a do řezu se ihned vloží celistvá hydroizolační bariéra (PE fólie nebo sklolaminátové desky). Vzniká tak souvislá clona, která zemní vlhkost spolehlivě a trvale přeruší. Je to nejtrvanlivější řešení a volíme ho všude, kde se dá zdivo proříznout.</P>

      <H2>Chemická injektáž</H2>
      <P>Injektáž nasytí zdivo hydrofobní látkou (krém nebo gel na bázi silanů a siloxanů), která v pórech vytvoří vodoodpudivou clonu. Nevkládá se žádná fyzická izolace – proto ji volíme tam, kde mechanické řezání nelze provést: u velmi silného, členitého nebo špatně přístupného zdiva, v rozích, u vnitřních příček nebo v blízkosti inženýrských sítí.</P>

      <H2>Kdy zvolit co</H2>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm">
          <div className="flex items-center gap-2 font-black uppercase italic text-neutral-dark text-sm mb-3"><Icons.Gem className="w-4 h-4 text-primary" /> Podřezání</div>
          <ul className="space-y-2 text-sm text-neutral-dark/70">
            <li className="flex gap-2"><Icons.CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Zdivo lze proříznout (přístup, pravidelná spára)</li>
            <li className="flex gap-2"><Icons.CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Chcete nejspolehlivější a nejtrvanlivější řešení</li>
            <li className="flex gap-2"><Icons.CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Cihla (pila) i tvrdý kámen a beton (lano)</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-neutral-dark/5 shadow-sm">
          <div className="flex items-center gap-2 font-black uppercase italic text-neutral-dark text-sm mb-3"><Icons.Zap className="w-4 h-4 text-primary" /> Injektáž</div>
          <ul className="space-y-2 text-sm text-neutral-dark/70">
            <li className="flex gap-2"><Icons.CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Řezání není možné (členité, velmi silné zdivo)</li>
            <li className="flex gap-2"><Icons.CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Špatný přístup, blízkost sítí, historický objekt</li>
            <li className="flex gap-2"><Icons.CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Priorita nulových otřesů a minimálního zásahu</li>
          </ul>
        </div>
      </div>

      <H2>Rozhodne prohlídka</H2>
      <P>Nejvhodnější metodu nejde spolehlivě určit od stolu – závisí na materiálu, tloušťce, přístupu a stavu konkrétní stavby. Po prohlídce a změření vlhkosti doporučíme řešení, které dává smysl technicky i cenově. U členitých staveb obě metody běžně kombinujeme.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

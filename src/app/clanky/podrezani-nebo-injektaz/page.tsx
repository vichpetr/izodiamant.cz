import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import Link from "next/link";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "podrezani-nebo-injektaz";
const TITLE = "Podřezání zdiva, nebo chemická injektáž?";
const DESC = "Kdy zvolit mechanické podřezání a kdy chemickou injektáž? Srovnání podle spolehlivosti, materiálu i přístupu ke zdivu. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: `/clanky/${SLUG}`, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
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
      related={["kolik-stoji-podrezani-zdiva", "podrezani-kamenneho-zdiva", "vysychani-zdiva"]}
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

      <H2>Co která metoda stojí</H2>
      <P>Obě metody se účtují za metr čtvereční řezné plochy, tedy za délku zdi vynásobenou její tloušťkou – u 10 m dlouhé stěny silné 45 cm jde o 4,5 m². Tloušťka je tak v ceně už započítaná a neplatí se zvlášť.</P>
      <P>Chemická injektáž i podřezání řetězovou pilou začínají na 2 500 Kč/m² řezné plochy, podřezání diamantovým lanem na 4 500 Kč/m². Rozdíl není v metodě samotné, ale v materiálu: lano zvládne kámen, beton i silné smíšené zdivo, kde pila ani injektáž nestačí. Nejsme plátci DPH, takže se k částce nic nepřipočítává. Podrobný rozpad najdete v článku <Link href="/clanky/kolik-stoji-podrezani-zdiva" className="text-primary-ink font-bold hover:underline">kolik stojí podřezání zdiva</Link>, orientační cenu spočítá <Link href="/#calculator" className="text-primary-ink font-bold hover:underline">kalkulačka</Link>.</P>

      <H2>Kde má injektáž limity</H2>
      <P>Injektáž nasytí póry zdiva, takže potřebuje materiál, do kterého se krém má kde vsáknout. U zdiva s dutinami, kavernami nebo volnými spárami se clona nemusí uzavřít souvisle a účinek je pak slabší než u řezu. Stejně tak nepomůže proti vlhkosti, která do stěny netáhne ze země, ale zatéká shora, z rozbitého svodu nebo z poruchy rozvodů – tam se nejdřív musí odstranit příčina.</P>
      <P>Proto před injektáží měříme vlhkost a díváme se, odkud voda přichází. Když je zdivo prořezatelné, dáváme přednost <Link href="/sluzby/diamantove-lano" className="text-primary-ink font-bold hover:underline">mechanickému podřezání</Link>; <Link href="/sluzby/chemicka-injektaz" className="text-primary-ink font-bold hover:underline">injektáž</Link> volíme tam, kde řez nedává smysl.</P>

      <H2>Jak dlouho zdivo schne</H2>
      <P>Obě metody zastaví vzlínání hned, ale voda, která ve stěně už je, mizí postupně. Orientačně počítejte přibližně s 1 cm tloušťky zdiva za měsíc – u příčky jde o týdny, u silné obvodové stěny o řadu měsíců. Vysychání podpoří sanační omítka a pravidelné větrání.</P>

      <H2>Rozhodne prohlídka</H2>
      <P>Nejvhodnější metodu nejde spolehlivě určit od stolu – závisí na materiálu, tloušťce, přístupu a stavu konkrétní stavby. Po prohlídce a změření vlhkosti doporučíme řešení, které dává smysl technicky i cenově. U členitých staveb obě metody běžně kombinujeme.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

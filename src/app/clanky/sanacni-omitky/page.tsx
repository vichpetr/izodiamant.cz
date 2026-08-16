import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "sanacni-omitky";
const TITLE = "Sanační omítky: proč běžná omítka nestačí";
const DESC = "Jak fungují sanační omítky, proč po sanaci nestačí klasická omítka a jak řeší zbytkovou vlhkost a soli ve zdivu. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["sanační omítky","sanační omítka","omítka na vlhké zdivo","sanační omítka vs vápenná","zbytková vlhkost omítka","soli ve zdivu omítka"],
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
      published="2026-10-04"
      intro={<>Po odstranění příčiny vlhkosti se často řeší, jakou omítku použít na sanované zdivo. <strong className="text-neutral-dark">Sanační omítky</strong> mají jinou strukturu než běžná vápenocementová omítka a plní specifickou funkci: pomáhají zdivu vysychat a zvládají zbytkovou vlhkost i soli. Nejsou ale samostatným řešením vlhkosti.</>}
    >
      <H2>Jak sanační omítka funguje</H2>
      <P>Sanační omítka je vysoce pórovitá a zároveň hydrofobní (vodoodpudivá). Díky velkému objemu vzduchových pórů propouští vlhkost ze zdiva ve formě vodní páry, která se odpaří z povrchu, aniž by omítku prosytila kapalná voda.</P>
      <P>Ve vzlínající vlhkosti jsou rozpuštěné soli. Sanační omítka je zachytí a ukládá hluboko ve svých pórech, takže krystalizují uvnitř omítky a nedostanou se na povrch. Líc stěny tak zůstává suchý, bez map a bez solných výkvětů.</P>

      <H2>Proč běžná omítka na vlhké zdivo nestačí</H2>
      <P>Klasická vápenocementová nebo sádrová omítka má hustou, málo pórovitou strukturu. Na vlhkém zdivu rychle nasákne, protože nemá kam vlhkost odvádět, a zůstává trvale vlhká.</P>
      <P>Soli ze zdiva krystalizují až na povrchu takové omítky. Krystaly zvětšují svůj objem, trhají povrch, tvoří výkvěty a omítka se odlupuje. Proto běžná omítka na dříve vlhké zdivo obvykle během krátké doby znovu selže.</P>

      <H2>Sanační omítka není náhrada za odstranění příčiny</H2>
      <P>Sanační omítka řeší následky a zbytkovou vlhkost, ne samotnou příčinu. Pokud zdivem dál vzlíná voda, i kvalitní sanační omítka má omezenou kapacitu a časem se zasolí a přestane plnit svou funkci.</P>
      <P>Vlastní příčinu, tedy vzlínající vlhkost, je nutné přerušit odděleně: vytvořením vodorovné bariéry podřezáním zdiva, nebo chemickou injektáží tam, kde řezat nelze. Sanační omítka je pak logický doplněk, který pomůže zdivu vyschnout a udrží povrch v pořádku.</P>

      <H2>Jak se sanační omítka správně aplikuje</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Otlučení staré, zasolené a poškozené omítky, obvykle až do výšky nejméně 80 cm nad viditelnou hranici vlhkosti.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Očištění spár a vyškrábání zasolené malty, aby se snížilo množství solí ve stěně.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Nanesení podhozu (špric) na maximálně část plochy, který zajistí přilnavost, ale nezabrání odpařování.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Nanesení sanační omítky v dostatečné tloušťce podle systému výrobce, obvykle v jedné nebo více vrstvách.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Dodržení technologických přestávek a nechání povrchu volně dýchat, bez uzavření nepropustným nátěrem nebo obkladem.</span></li>
      </ul>

      <H2>Na co dát pozor</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Sanační omítku nepřetírat běžnou disperzní barvou ani nezakrývat parotěsným obkladem, který uzavře odpařování.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Volit paropropustné, k sanačnímu systému určené povrchové úpravy.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Počítat s tím, že sanační omítka funguje ve spojení s odstraněnou příčinou a probíhajícím vysycháním zdiva.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Nechat návrh tloušťky a rozsahu na posouzení podle míry zasolení a vlhkosti konkrétní stěny.</span></li>
      </ul>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

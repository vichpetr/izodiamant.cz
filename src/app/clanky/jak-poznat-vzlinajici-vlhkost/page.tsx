import type { Metadata } from "next";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "jak-poznat-vzlinajici-vlhkost";
const TITLE = "Jak poznat vzlínající vlhkost";
const DESC = "Podle čeho poznáte vzlínající vlhkost a jak ji odlišit od kondenzace a zatékání. Příznaky, jednoduché testy i správné řešení. Vracíme zdraví vaší stavbě.";

export const metadata: Metadata = {
  ...pageMetadata({ path: "/clanky/" + SLUG, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["vzlínající vlhkost","jak poznat vlhké zdivo","vlhkost vs kondenzace","příznaky vzlínající vlhkosti","zatékání nebo vzlínání","diagnostika vlhkého zdiva"],
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
      published="2026-09-13"
      intro={<>Vlhké zdivo může mít víc příčin a každá se řeší jinak. <strong className="text-neutral-dark">Vzlínající vlhkost</strong> stoupá kapilárami z podloží nahoru, kondenzace se sráží na chladném povrchu a zatékání přichází zvenčí. Než se pustíte do oprav, potřebujete vědět, s čím máte tu čest.</>}
    >
      <H2>Typické příznaky vzlínající vlhkosti</H2>
      <P>Vzlínající vlhkost se pozná podle charakteristického rozložení: vlhké mapy začínají u podlahy a stoupají zhruba do výšky 0,5 až 1,5 metru. Nad touto hranicí zdivo obvykle vysychá, protože voda se v kapilárách dostane jen do určité výšky, kde se odpar vyrovná s přísunem.</P>
      <P>Doprovodné jevy jsou opadávající a bublající omítka u soklu, bílé solné výkvěty na povrchu, tmavnutí zdiva a plíseň nebo zatuchlý zápach v přízemí. Zdivo bývá vlhké dlouhodobě a stav se v čase nelepší sám od sebe.</P>

      <H2>Vzlínání versus kondenzace</H2>
      <P>Kondenzace vzniká na chladném povrchu, kam dopadá vlhký vzduch z místnosti. Objevuje se spíš v koutech, za nábytkem, u stropu a kolem tepelných mostů, tedy ne nutně jen u podlahy. Zhoršuje se v topné sezoně a při nedostatečném větrání.</P>
      <P>Vzlínající vlhkost naopak jde zdola nahoru a je nezávislá na tom, jak větráte. Pokud je stěna vlhká hlavně v pásu nad podlahou a suchá výš, ukazuje to na vzlínání. Když je naopak orosený chladný povrch nahoře nebo v rozích, jde spíš o kondenzaci.</P>

      <H2>Jednoduchý fóliový test</H2>
      <P>Orientačně kondenzaci od vlhkosti ve zdivu odliší fóliový test. Na suchý úsek stěny přilepte po obvodu kus neprodyšné fólie zhruba 30 na 30 centimetrů a nechte ji dva až tři dny.</P>
      <P>Když se vlhkost objeví na vnější straně fólie směrem do místnosti, sráží se vzdušná vlhkost a jde o kondenzaci. Pokud jsou kapky pod fólií na straně ke zdi a zdivo je pod ní vlhčí, přichází voda z konstrukce, tedy vzlínáním nebo zatékáním.</P>

      <H2>Vzlínání versus zatékání</H2>
      <P>Zatékání srážkové vody bývá lokální a vázané na konkrétní zdroj: ucpaný nebo netěsný svod, chybějící oplechování, terén navršený nad úroveň podlahy nebo popraskanou fasádu. Vlhká mapa proto nemusí kopírovat pás u podlahy, ale vede od místa vniku vody.</P>
      <P>Zatékání se často zhoršuje po deštích a tání, zatímco vzlínání je vytrvalé po celý rok. Pomůže sledovat, zda vlhkost reaguje na počasí, a zkontrolovat okapy, terén a stav fasády nad postiženým místem.</P>

      <H2>Na co se při domácí diagnostice zaměřit</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Výška vlhkosti: pás od podlahy do zhruba 1,5 metru napovídá vzlínání.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Rozložení: koutky a chladné plochy nahoře spíš značí kondenzaci.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Vazba na počasí: zhoršení po deštích ukazuje na zatékání.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Solné výkvěty a bublající sokl: typický doprovod vzlínající vlhkosti.</span></li>
        <li className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /><span>Reakce na větrání: pokud lepší větrání nepomáhá, jde nejspíš o vodu z konstrukce.</span></li>
      </ul>

      <H2>Kdy zavolat odborníka</H2>
      <P>Domácí testy dají orientaci, ale přesnou míru zavlhčení a hloubku vlhkosti ve zdivu určí až měření gravimetrickou nebo odporovou metodou. Odborná prohlídka posoudí i souběh více příčin, který u starších domů není výjimkou.</P>
      <P>Správná diagnóza rozhoduje o řešení: u vzlínající zemní vlhkosti je namístě obnovit vodorovnou hydroizolační bariéru mechanickým podřezáním nebo chemickou injektáží, zatímco kondenzaci řeší větrání a odstranění tepelných mostů. Nezávaznou prohlídku a kalkulaci u nás pořídíte zdarma.</P>

      <H2>Naše metody</H2>
      <ServiceLinks items={SERVICES} />
    </ArticleLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Icons } from "@/components/Icons";
import ArticleLayout, { H2, P, ServiceLinks } from "@/components/ArticleLayout";
import servicesData from "@/data/services.json";
import { pageMetadata } from "@/lib/seo";
import { isSlugPublished } from "@/lib/articles";

const SLUG = "kolik-stoji-podrezani-zdiva";
const TITLE = "Kolik stojí podřezání zdiva";
const DESC = "Ceny podřezání a sanace zdiva: řetězová pila a chemická injektáž od 2 500 Kč/m², diamantové lano od 4 500 Kč/m² (za m² řezné plochy). Nejsme plátci DPH.";

export const metadata: Metadata = {
  ...pageMetadata({ path: `/clanky/${SLUG}`, title: TITLE, description: DESC }),
  robots: { index: isSlugPublished(SLUG), follow: true },
  keywords: ["kolik stojí podřezání zdiva", "podřezání zdiva cena", "cena sanace vlhkého zdiva", "podřezání zdiva cena za m2", "podřezání domu cena", "ceník podřezání zdiva"],
};

// Ceny bereme přímo ze services.json, aby se článek nemohl rozejít s webem
// (cenový invariant – viz skill site-invariants).
const PRICES = [
  { label: "Podřezání řetězovou pilou", price: servicesData["retezova-pila"].priceRange, note: "cihelné zdivo s pravidelnou spárou" },
  { label: "Chemická injektáž", price: servicesData["chemicka-injektaz"].priceRange, note: "tam, kde nelze řezat" },
  { label: "Podřezání diamantovým lanem", price: servicesData["diamantove-lano"].priceRange, note: "kámen, beton i silné smíšené zdivo" },
];

const SERVICES = [
  { href: "/sluzby/retezova-pila", label: "Řetězová pila", note: "od 2 500 Kč/m² – cihelné zdivo." },
  { href: "/sluzby/diamantove-lano", label: "Diamantové lano", note: "od 4 500 Kč/m² – kámen a beton." },
  { href: "/sluzby/chemicka-injektaz", label: "Chemická injektáž", note: "od 2 500 Kč/m² – kde nelze řezat." },
];

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      title={TITLE}
      description={DESC}
      published="2026-08-16"
      intro={<>Cena podřezání se počítá za <strong className="text-neutral-dark">metr čtvereční (m²) řezné plochy</strong> – tedy za délku zdi vynásobenou její tloušťkou. Níže najdete orientační sazby a co všechno konečnou cenu ovlivňuje.</>}
    >
      <H2>Orientační ceny</H2>
      <P>Sazby platí za m² řezné plochy; u silnějšího zdiva je řezná plocha větší, takže cena úměrně roste. <strong className="text-neutral-dark">Nejsme plátci DPH</strong>, uvedené částky se tedy o daň dále nenavyšují.</P>
      <div className="grid gap-3 pt-1">
        {PRICES.map((p) => (
          <div key={p.label} className="flex items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-dark/5 shadow-sm">
            <div>
              <div className="font-black uppercase italic text-neutral-dark text-sm">{p.label}</div>
              <div className="text-neutral-dark/50 text-xs uppercase tracking-wider font-bold mt-0.5">{p.note}</div>
            </div>
            <div className="font-black text-primary-ink uppercase text-sm whitespace-nowrap">{p.price.replace(/^Orientační cena\s*/i, "")}</div>
          </div>
        ))}
      </div>

      <H2>Jak se počítá m² řezné plochy</H2>
      <P>Řezná plocha není plocha stěny, ale plocha vodorovného řezu, který zdivem vedeme: délka podřezávaného úseku vynásobená tloušťkou zdiva. U 10 m dlouhé stěny silné 45 cm jde o 4,5 m², u stejně dlouhé stěny silné 90 cm už o 9 m².</P>
      <P>Právě proto se cena za m² hodí lépe než sazba za běžný metr délky: tloušťka zdiva rozhoduje o množství práce i opotřebení nástrojů a v ceně za m² je zohledněná přímo, ne přirážkou.</P>

      <H2>Co konečnou cenu ovlivňuje</H2>
      <ul className="space-y-2 text-neutral-dark/80">
        {[
          "Zvolená metoda (diamantové lano je dražší než pila kvůli tvrdosti materiálů)",
          "Materiál zdiva – kámen a beton jsou náročnější než cihla",
          "Tloušťka zdiva – u silnějších stěn roste řezná plocha, a tím i cena",
          "Délka podřezávaného úseku zdi",
          "Přístupnost a členitost stavby",
        ].map((t) => (
          <li key={t} className="flex gap-3"><Icons.CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />{t}</li>
        ))}
      </ul>

      <H2>Jak zjistit přesnou cenu</H2>
      <P>Nezávazný odhad si spočítáte během chvíle v naší online kalkulačce – zadáte materiál, tloušťku a délku zdi a kalkulačka z nich řeznou plochu i cenu spočítá sama. Závaznou nabídku pak zpracujeme po prohlídce objektu, kde cenu potvrdíme, aby se ve výsledné faktuře neměnila.</P>
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

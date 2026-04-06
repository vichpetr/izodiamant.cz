import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Zásady používání cookies",
  description: "Informace o tom, jak na našem webu používáme soubory cookies a jak je můžete spravovat.",
  alternates: {
    canonical: 'https://izodiamant.cz/cookies',
  },
};

export default function CookiesPolicy() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-16 rounded-3xl shadow-sm">
          <h1 className="text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-10">Zásady používání cookies</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-neutral-dark/80 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">1. Co jsou cookies a jak fungují?</h2>
              <p>
                Soubory cookies jsou krátké textové soubory, které webová stránka odešle do Vašeho prohlížeče (Chrome, Firefox, Safari apod.) při každé Vaší návštěvě. Tyto soubory umožňují webu zaznamenat informace o Vaší návštěvě, jako je například preferovaný jazyk, nastavení souhlasu s lištou nebo jiné specifické volby. 
              </p>
              <p>
                Díky cookies je prohlížení webu IZODIAMANT.cz pro návštěvníky snazší a efektivnější. Bez nich by bylo prohlížení webu složitější, protože by si stránka nemohla "pamatovat" Vaše předvolby. Cookies také hrají důležitou roli v oblasti bezpečnosti a pomáhají nám chránit Vaše data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">2. Jaké konkrétní typy cookies používáme?</h2>
              <p>Na našem webu využíváme různé kategorie souborů cookies, které se liší svým účelem a dobou uložení:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Technické a nezbytné cookies:</strong> Tyto soubory jsou naprosto klíčové pro správné fungování webu. Zajišťují například navigaci mezi stránkami, správné zobrazení interaktivních prvků (jako je naše cenová kalkulačka) a uložení Vaší volby ohledně ostatních kategorií cookies. Bez těchto souborů nemůže být web plnohodnotně funkční.
                </li>
                <li>
                  <strong>Analytické a statistické cookies:</strong> Pomáhají nám anonymně sbírat data o tom, jak lidé používají náš web. Sledujeme například, které projekty v referencích jsou nejčtenější nebo odkud k nám lidé přicházejí. Pro tento účel využíváme službu Google Analytics. Tato data nám umožňují web neustále vylepšovat pro Vaše pohodlí.
                </li>
                <li>
                  <strong>Preferenční cookies:</strong> Umožňují webu zapamatovat si informace, které mění způsob, jakým se web chová nebo vypadá (např. trvalé nastavení regionu).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">3. Jak můžete správu cookies ovlivnit?</h2>
              <p>
                Při Vaší první návštěvě webu se zobrazí tzv. cookie lišta, kde můžete vyjádřit svůj souhlas s použitím analytických cookies. Své rozhodnutí můžete kdykoliv změnit smazáním historie a cookies ve svém prohlížeči, což vyvolá opětovné zobrazení lišty.
              </p>
              <p>
                Většina moderních internetových prohlížečů je standardně nastavena tak, aby cookies automaticky přijímala. Pokud si však přejete mít nad těmito soubory plnou kontrolu, můžete ve svém prohlížeči nastavit blokování všech cookies nebo povolení pouze některých z nich.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">4. Podrobný návod pro správu v prohlížečích</h2>
              <p>
                Informace o nastavení a správě cookies pro nejrozšířenější prohlížeče naleznete na těchto oficiálních stránkách podpory:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Chrome:</strong> Nastavení soukromí a zabezpečení.</li>
                <li><strong>Mozilla Firefox:</strong> Blokování obsahu a správa cookies.</li>
                <li><strong>Apple Safari:</strong> Správa cookies a dat webových stránek na Macu.</li>
                <li><strong>Microsoft Edge:</strong> Odstraňování a správa souborů cookie.</li>
              </ul>
              <p className="mt-4">
                Upozorňujeme, že úplné zakázání všech cookies (včetně technických) může vést k tomu, že některé části webu IZODIAMANT.cz nebudou pracovat správně nebo se nebudou zobrazovat korektně.
              </p>
            </section>

            <div className="pt-10 border-t border-neutral-light text-sm italic">
              Zásady používání souborů cookies byly naposledy aktualizovány dne 6. 4. 2026. Pokud máte dotazy, neváhejte nás kontaktovat.
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Zásady používání cookies",
  description: "Informace o tom, jak na našem webu používáme soubory cookies a jak je můžete spravovat. Zjistěte, jak cookies pomáhají zlepšovat naše služby.",
  alternates: {
    canonical: 'https://izodiamant.cz/cookies',
  },
};

export default function CookiesPolicy() {
  return (
    <main className="min-h-screen bg-neutral-light text-foreground">
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-16 rounded-3xl shadow-sm border border-neutral-dark/5">
          <h1 className="text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-10">Zásady používání cookies</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-neutral-dark/80 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">1. Co jsou soubory cookies a k čemu slouží?</h2>
              <p>
                Soubory cookies jsou malé textové datové soubory, které náš web IZODIAMANT.cz ukládá do Vašeho koncového zařízení (počítač, tablet nebo chytrý telefon) prostřednictvím webového prohlížeče. Cookies samy o sobě neslouží k identifikaci konkrétní osoby, ale umožňují webové stránce rozpoznat Vaše zařízení při opakované návštěvě.
              </p>
              <p>
                Hlavním účelem cookies je zajistit plynulý a bezpečný chod webu a přizpůsobit jeho obsah Vašim preferencím. Díky těmto souborům si stránka může "pamatovat" Vaše nastavení, jako je například volba jazyka nebo potvrzení o seznámení se s cookie lištou, takže tyto informace nemusíte zadávat při každé další návštěvě znovu. Cookies jsou také nezbytné pro správné fungování interaktivních prvků, jako je naše <strong>cenová kalkulačka podřezání zdiva</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">2. Jaké typy cookies používáme?</h2>
              <p>Na našich stránkách využíváme několik kategorií cookies, z nichž každá má svůj specifický význam:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Nezbytné technické cookies:</strong> Tyto soubory jsou vyžadovány pro samotnou existenci a základní funkčnost webu. Bez nich by nebylo možné zajistit navigaci mezi stránkami, odesílání poptávkových formulářů nebo základní bezpečnostní prvky webu. Tyto cookies jsou aktivní vždy a nevyžadují Váš předchozí souhlas.
                </li>
                <li>
                  <strong>Analytické a výkonnostní cookies:</strong> Pomáhají nám anonymně sbírat statistické informace o tom, jak uživatelé s webem IZODIAMANT interagují. Sledujeme například počet návštěvníků, čas strávený na jednotlivých stránkách nebo to, které naše služby (např. <strong>diamantové lano</strong> nebo <strong>řetězová pila</strong>) Vás zajímají nejvíce. K těmto účelům využíváme prověřené nástroje jako Google Analytics. Získaná data využíváme výhradně ke zlepšování obsahu a struktury webu.
                </li>
                <li>
                  <strong>Funkční a preferenční cookies:</strong> Tyto soubory umožňují webu zapamatovat si Vaše volby a poskytnout Vám vylepšené a personalizované funkce. Mohou si například zapamatovat Vaše nastavení v interaktivních částech webu, aby pro Vás byla práce s nimi při příští návštěvě pohodlnější.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">3. Souhlas a správa nastavení cookies</h2>
              <p>
                Při Vaší první návštěvě našeho webu se Vám zobrazí informační lišta, která Vám umožní zvolit rozsah cookies, se kterými souhlasíte. Technické cookies jsou aktivní automaticky, zatímco analytické cookies využíváme pouze s Vaším výslovným souhlasem.
              </p>
              <p>
                Své rozhodnutí můžete kdykoliv v budoucnu změnit. Nejjednodušším způsobem je vymazání souborů cookies v historii Vašeho prohlížeče, což způsobí, že se cookie lišta při příští návštěvě webu IZODIAMANT.cz zobrazí znovu. Většina moderních prohlížečů také umožňuje nastavit automatické blokování cookies nebo varování před jejich uložením.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">4. Jak nastavit prohlížeč pro správu cookies?</h2>
              <p>
                Postup pro správu a blokování cookies se u jednotlivých prohlížečů liší. Podrobné návody pro nejčastěji používané prohlížeče naleznete na následujících odkazech:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Chrome:</strong> Správa souborů cookie a dat webů.</li>
                <li><strong>Mozilla Firefox:</strong> Rozšířená ochrana proti sledování.</li>
                <li><strong>Safari (Mac):</strong> Správa cookies a dat webových stránek.</li>
                <li><strong>Microsoft Edge:</strong> Odstraňování a správa souborů cookie.</li>
              </ul>
              <p className="mt-4">
                Mějte prosím na paměti, že pokud se rozhodnete cookies zcela zablokovat, některé pokročilé funkce našeho webu nemusí pracovat správně nebo se nemusí zobrazit vůbec. To se týká zejména interaktivních prvků, které vyžadují zachování stavu mezi jednotlivými kroky prohlížení.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">5. Doba uložení a zabezpečení</h2>
              <p>
                Některé cookies jsou tzv. "relační" a vymažou se automaticky po zavření prohlížeče. Jiné jsou "trvalé" a zůstávají v zařízení uloženy po delší dobu (obvykle několik měsíců až let), nebo dokud je sami neodstraníte. IZODIAMANT dbá na to, aby všechny využívané cookies pocházely od důvěryhodných partnerů a splňovaly vysoké nároky na bezpečnost a ochranu soukromí návštěvníků.
              </p>
            </section>

            <div className="pt-10 border-t border-neutral-light text-sm italic text-neutral-dark/50">
              Tyto zásady používání cookies jsou platné od 6. dubna 2026. Vyhrazujeme si právo na jejich aktualizaci v souladu s technologickým vývojem a platnou legislativou. Pokud máte k používání cookies na našem webu jakékoliv dotazy, kontaktujte nás na info@izodiamant.cz.
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

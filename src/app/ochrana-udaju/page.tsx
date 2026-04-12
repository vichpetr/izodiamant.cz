import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Zásady zpracování a ochrany osobních údajů na webu izodiamant.cz v souladu s GDPR. Informace o tom, jak chráníme vaše data při poptávce sanace zdiva.",
  alternates: {
    canonical: 'https://izodiamant.cz/ochrana-udaju',
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-neutral-light text-foreground">
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-16 rounded-3xl shadow-sm border border-neutral-dark/5">
          <h1 className="text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-10">Ochrana osobních údajů</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-neutral-dark/80 font-medium leading-relaxed">
            <p>
              Ochrana Vašich osobních údajů je pro nás v <strong>IZODIAMANT</strong> naprostou prioritou. Jako specialisté na <strong>sanaci vlhkého zdiva</strong> a <strong>podřezávání domů</strong> si zakládáme na důvěře, kterou do nás naši zákazníci vkládají. Tento dokument slouží k tomu, aby Vám poskytl transparentní a srozumitelný přehled o tom, jaké osobní údaje zpracováváme, za jakým konkrétním účelem, na jakém právním základě a jaká jsou Vaše práva v souvislosti s nařízením GDPR (Obecné nařízení o ochraně osobních údajů).
            </p>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">1. Totožnost a kontaktní údaje správce</h2>
              <p>
                Správcem osobních údajů podle čl. 4 bod 7 nařízení Evropského parlamentu a Rady (EU) 2016/679 (GDPR) je fyzická osoba podnikající: <strong>Václav Ropek, IČO: 74650726</strong>, se sídlem na adrese Mokrá Lhota 26, 539 44 Nové Hrady (dále jen: "správce").
              </p>
              <p>
                Jsme plně k dispozici pro jakékoliv dotazy nebo požadavky týkající se ochrany soukromí. Můžete nás kontaktovat přímo na e-mailové adrese: <strong>info@izodiamant.cz</strong> nebo telefonicky na čísle <strong>+420 737 017 012</strong>. Vaše požadavky budeme řešit bez zbytečného odkladu v zákonných lhůtách.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">2. Rozsah a účel zpracování údajů</h2>
              <p>Zpracováváme pouze ty osobní údaje, které jsou nezbytně nutné pro profesionální poskytování našich služeb sanace a izolace staveb:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Kontaktní formulář a poptávkové řízení:</strong> Při odeslání poptávky zpracováváme Vaše jméno, příjmení, e-mailovou adresu, telefonní číslo a doplňující technické parametry stavby (např. tloušťka zdiva, materiál, lokalita). Tyto údaje jsou klíčové pro přípravu přesné a nezávazné cenové nabídky na <strong>podřezání zdiva</strong> nebo <strong>chemickou injektáž</strong>. Právním základem je zde plnění smlouvy nebo provedení opatření před uzavřením smlouvy na Vaši žádost.
                </li>
                <li>
                  <strong>Realizace zakázky:</strong> V případě uzavření dohody o provedení práce zpracováváme také fakturační údaje (adresa bydliště, IČO) a adresu místa realizace sanace. Tyto údaje uchováváme pro účely řádného plnění smluvních závazků a následné fakturace dle platných zákonů ČR.
                </li>
                <li>
                  <strong>Analýza návštěvnosti a uživatelská zkušenost:</strong> Na našem webu využíváme nástroje pro analýzu chování uživatelů (např. Google Analytics). Tyto údaje jsou anonymizované a pomáhají nám lépe pochopit, o které technologie sanace je největší zájem, abychom mohli obsah webu neustále vylepšovat. Právním základem je náš oprávněný zájem na rozvoji podnikání nebo Váš dobrovolný souhlas s analytickými cookies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">3. Doba uchovávání osobních údajů</h2>
              <p>
                Vaše soukromí respektujeme a údaje neuchováváme déle, než je nezbytně nutné:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Údaje z poptávkových formulářů uchováváme po dobu vyřizování nabídky, nejdéle však 2 roky, pokud nedojde k následné realizaci zakázky.</li>
                <li>V případě realizované sanace uchováváme údaje po dobu 10 let z důvodu zákonných povinností (účetnictví, daně).</li>
                <li>Vzhledem k tomu, že na naše hydroizolační práce poskytujeme dlouhodobé záruky, uchováváme nezbytné technické detaily realizace (včetně vazby na Vaši osobu) po dobu trvání této záruky, abychom mohli v budoucnu řádně dostát svým závazkům.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">4. Zabezpečení a příjemci údajů</h2>
              <p>
                Vaše data jsou u nás v maximálním bezpečí. Neprodáváme je, nepronajímáme ani nepředáváme žádným třetím stranám pro účely marketingu. Přístup k údajům mají pouze prověřené subjekty, které nám pomáhají s provozem:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Poskytovatelé technického řešení webu a cloudového hostingu (Vercel, GitHub).</li>
                <li>Poskytovatelé analytických a měřicích služeb (Google LLC).</li>
                <li>Externí účetní kancelář (pouze v případě smluvního vztahu).</li>
              </ul>
              <p className="mt-4">
                Web izodiamant.cz je plně šifrován pomocí bezpečnostního certifikátu SSL (HTTPS), což zajišťuje, že veškerá data přenášená mezi Vaším prohlížečem a naším serverem jsou chráněna proti odposlechu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">5. Vaše práva dle nařízení GDPR</h2>
              <p>Jako subjekt údajů máte v souvislosti s ochranou osobních údajů široká práva:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong>Právo na přístup:</strong> Máte právo vědět, jaké konkrétní údaje o Vás zpracováváme a proč.</li>
                <li><strong>Právo na opravu:</strong> Pokud zjistíte, že jsou Vaše údaje neaktuální nebo nesprávné, na Vaši žádost je okamžitě opravíme.</li>
                <li><strong>Právo na výmaz (právo být zapomenut):</strong> Pokud již neexistuje zákonný důvod pro zpracování, na Vaši žádost údaje vymažeme.</li>
                <li><strong>Právo na omezení zpracování:</strong> V určitých situacích můžete požádat o pozastavení nakládání s Vašimi daty.</li>
                <li><strong>Právo na přenositelnost:</strong> Můžete od nás získat své údaje ve strukturovaném, běžně používaném formátu.</li>
                <li><strong>Právo vznést námitku:</strong> Máte právo kdykoliv namítat proti zpracování založeném na oprávněném zájmu.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">6. Závěrečná ustanovení</h2>
              <p>
                Odesláním poptávkového formuláře potvrzujete, že jste se seznámili s těmito podmínkami ochrany osobních údajů a že je v celém rozsahu přijímáte. Tyto zásady jsou pravidelně revidovány tak, aby odpovídaly aktuální legislativě a technickému vývoji našeho webu.
              </p>
            </section>

            <div className="pt-10 border-t border-neutral-light text-sm italic text-neutral-dark/50">
              Tyto zásady ochrany osobních údajů jsou platné a účinné od 6. dubna 2026. Vyhrazujeme si právo na jejich úpravu v případě změny právních předpisů nebo změn v procesech firmy IZODIAMANT.
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

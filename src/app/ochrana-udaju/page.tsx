import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů",
  description: "Zásady zpracování a ochrany osobních údajů na webu izodiamant.cz v souladu s GDPR.",
  alternates: {
    canonical: 'https://izodiamant.cz/ochrana-udaju',
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-16 rounded-3xl shadow-sm">
          <h1 className="text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-10">Ochrana osobních údajů</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-neutral-dark/80 font-medium leading-relaxed">
            <p>
              Ochrana Vašich osobních údajů je pro nás v IZODIAMANT prioritou. Tento dokument obsahuje podrobné informace o tom, jaké osobní údaje zpracováváme, za jakým účelem, na jakém právním základě a jaká jsou Vaše práva v souvislosti s nařízením GDPR (Obecné nařízení o ochraně osobních údajů).
            </p>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">1. Totožnost a kontaktní údaje správce</h2>
              <p>
                Správcem osobních údajů podle čl. 4 bod 7 nařízení Evropského parlamentu a Rady (EU) 2016/679 (GDPR) je <strong>Václav Ropek, IČO: 74650726</strong>, se sídlem Mokrá Lhota 26, 539 44 Nové Hrady (dále jen: "správce").
              </p>
              <p>
                Pokud máte jakékoliv dotazy ohledně zpracování Vašich dat, můžete nás kontaktovat na e-mailu: <strong>info@izodiamant.cz</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">2. Jaké údaje zpracováváme a proč?</h2>
              <p>Zpracováváme pouze údaje, které jsou nezbytné pro poskytování našich služeb sanace zdiva a podřezávání domů:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Kontaktní formulář a poptávky:</strong> Zpracováváme Vaše jméno, e-mail, telefonní číslo a technické parametry stavby (pro účely přesné kalkulace). Tyto údaje potřebujeme k vyřízení Vašeho dotazu, přípravě cenové nabídky a následné komunikaci. Právním základem je zde plnění smlouvy nebo opatření před uzavřením smlouvy.
                </li>
                <li>
                  <strong>Technické údaje a soubory cookies:</strong> Při návštěvě našeho webu zpracováváme údaje o Vašem chování (např. navštívené stránky, anonymizovaná IP adresa, typ prohlížeče). Tyto údaje využíváme ke zlepšování webu a pro analytické účely (přes Google Analytics). Právním základem je náš oprávněný zájem nebo Váš souhlas.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">3. Doba uložení osobních údajů</h2>
              <p>
                Vaše osobní údaje uchováváme pouze po dobu nezbytně nutnou. Údaje z kontaktních formulářů uchováváme po dobu vyřizování poptávky a následně po dobu 2 let pro případ další komunikace, pokud nedojde k uzavření smlouvy. 
              </p>
              <p>
                V případě realizace zakázky uchováváme údaje po dobu stanovenou zákonem (účetní a daňové předpisy, obvykle 10 let) a s ohledem na poskytovanou prodlouženou záruku na naše hydroizolační práce.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">4. Komu údaje předáváme?</h2>
              <p>
                Vaše data jsou u nás v bezpečí a nepředáváme je žádným třetím stranám pro marketingové účely. K Vašim údajům mohou mít přístup prověření zpracovatelé, kteří nám pomáhají s provozem webu a služeb:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Poskytovatelé IT služeb a hostingu (Vercel, GitHub).</li>
                <li>Poskytovatelé analytických nástrojů (Google LLC).</li>
                <li>Externí účetní (pouze v případě realizované zakázky).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">5. Vaše práva v souvislosti s GDPR</h2>
              <p>Podle nařízení o ochraně osobních údajů máte právo:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li><strong>Právo na přístup:</strong> Můžete od nás chtít informaci, jaké Vaše údaje zpracováváme.</li>
                <li><strong>Právo na opravu:</strong> Máte právo na aktualizaci svých údajů, pokud jsou neúplné nebo nesprávné.</li>
                <li><strong>Právo na výmaz:</strong> Můžete požadovat smazání svých údajů, pokud neexistuje zákonný důvod pro jejich další uchování.</li>
                <li><strong>Právo na omezení zpracování:</strong> V určitých případech můžete chtít, abychom s Vašimi údaji dále nenakládali.</li>
                <li><strong>Právo vznést námitku:</strong> Máte právo namítat proti zpracování založeném na oprávněném zájmu správce.</li>
                <li><strong>Právo podat stížnost:</strong> Máte právo podat stížnost u Úřadu pro ochranu osobních údajů.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">6. Zabezpečení dat</h2>
              <p>
                V IZODIAMANT využíváme moderní technické i organizační opatření, abychom Vaše osobní údaje ochránili před neoprávněným přístupem, ztrátou nebo zničením. Veškerá komunikace s naším webem probíhá přes zabezpečený protokol HTTPS (SSL šifrování).
              </p>
            </section>

            <div className="pt-10 border-t border-neutral-light text-sm italic">
              Tyto zásady ochrany osobních údajů jsou účinné od 6. 4. 2026. Vyhrazujeme si právo tyto zásady v budoucnu aktualizovat v souladu s legislativními změnami.
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

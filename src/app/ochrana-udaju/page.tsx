import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-16 rounded-3xl shadow-sm">
          <h1 className="text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-10">Ochrana osobních údajů</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-neutral-dark/80 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">1. Základní ustanovení</h2>
              <p>
                Správcem osobních údajů podle čl. 4 bod 7 nařízení Evropského parlamentu a Rady (EU) 2016/679 o ochraně fyzických osob v souvislosti se zpracováním osobních údajů a o volném pohybu těchto údajů (dále jen: "GDPR") je Václav Ropek, IČO: 74650726, se sídlem Mokrá Lhota 26, 539 44 Nové Hrady (dále jen: "správce").
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">2. Zdroje a kategorie zpracovávaných osobních údajů</h2>
              <p>
                Správce zpracovává osobní údaje, které jste mu poskytli prostřednictvím kontaktního formuláře nebo kalkulačky na webových stránkách izodiamant.cz. Jedná se především o:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Jméno a příjmení</li>
                <li>E-mailová adresa</li>
                <li>Telefonní číslo</li>
                <li>Technické parametry stavby (pro účely kalkulace)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">3. Zákonný důvod a účel zpracování</h2>
              <p>
                Zákonným důvodem zpracování osobních údajů je váš souhlas udělený odesláním formuláře a nezbytnost pro plnění opatření přijatých před uzavřením smlouvy (příprava cenové nabídky). Účelem zpracování je vyřízení vaší poptávky a komunikace ohledně sanace zdiva.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">4. Doba uchovávání údajů</h2>
              <p>
                Správce uchovává osobní údaje po dobu nezbytnou k vyřízení poptávky a následné realizaci zakázky, nejdéle však po dobu 2 let od odeslání poptávky, pokud není uzavřena smlouva o dílo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">5. Vaše práva</h2>
              <p>
                Za podmínek stanovených v GDPR máte právo na přístup ke svým osobním údajům, právo na opravu, právo na výmaz a právo vznést námitku proti zpracování. Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů.
              </p>
            </section>

            <div className="pt-10 border-t border-neutral-light text-sm italic">
              Tyto podmínky nabývají účinnosti dnem 1. 3. 2026.
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

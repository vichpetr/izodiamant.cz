import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CookiesPolicy() {
  return (
    <main className="min-h-screen bg-neutral-light">
      <Header />
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-16 rounded-3xl shadow-sm">
          <h1 className="text-4xl font-black text-neutral-dark uppercase tracking-tighter italic mb-10">Zásady používání cookies</h1>
          
          <div className="prose prose-neutral max-w-none space-y-8 text-neutral-dark/80 font-medium leading-relaxed">
            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">1. Co jsou cookies?</h2>
              <p>
                Soubory cookies jsou krátké textové soubory, které webová stránka odešle do Vašeho prohlížeče. Umožňují webu zaznamenat informace o Vaší návštěvě, například zvolený jazyk a další nastavení. Příští návštěva stránek tak pro Vás může být snazší a produktivnější.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">2. Jaké cookies používáme?</h2>
              <p>Na našem webu používáme tyto typy cookies:</p>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Nezbytné cookies:</strong> Jsou nutné pro zajištění základních funkcí webu (např. navigace nebo uložení nastavení cookies). Web bez nich nemůže správně fungovat.
                </li>
                <li>
                  <strong>Analytické cookies:</strong> Pomáhají nám pochopit, jak návštěvníci interagují s webem (např. které stránky jsou nejnavštěvovanější). Využíváme k tomu službu Google Analytics. Tyto údaje jsou anonymizované.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">3. Souhlas a odmítnutí cookies</h2>
              <p>
                Souhlas s používáním cookies můžete udělit prostřednictvím lišty v dolní části webu. Nastavení cookies můžete také kdykoliv změnit ve svém webovém prohlížeči, kde lze ukládání cookies zakázat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-tight text-neutral-dark mb-4">4. Správa cookies v prohlížeči</h2>
              <p>
                Většina prohlížečů cookies automaticky přijímá. Pokud však cookies používat nechcete, musíte je v prohlížeči odstranit nebo zablokovat. Informace o nastavení konkrétního prohlížeče naleznete na následujících adresách:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google Chrome</li>
                <li>Mozilla Firefox</li>
                <li>Safari</li>
                <li>Microsoft Edge</li>
              </ul>
            </section>

            <div className="pt-10 border-t border-neutral-light text-sm italic">
              Poslední aktualizace dne 1. 3. 2026.
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

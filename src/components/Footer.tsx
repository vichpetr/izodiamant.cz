import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const content = {
    desc: "Specialisté na sanaci vlhkého zdiva a podřezávání diamantovým lanem. Vracíme zdraví vaší stavbě.",
    nav: "Navigace",
    services: "Služby",
    contact: "Kontakt",
    rights: "Všechna práva vyhrazena.",
    privacy: "Ochrana osobních údajů",
    cookies: "Zásady cookies",
  };

  return (
    <footer className="bg-neutral-dark text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-sm bg-primary flex items-center justify-center text-neutral-dark font-black text-lg">
                IZ
              </div>
              <span className="font-black text-xl text-white tracking-tighter uppercase">
                IZO<span className="text-primary">DIAMANT</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              {content.desc}
            </p>
          </div>

          <div>
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-8">{content.nav}</h3>
            <ul className="space-y-4 font-bold text-sm">
              <li><Link href="/#technologie" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">Technologie</Link></li>
              <li><Link href="/#calculator" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">Kalkulátor</Link></li>
              <li><Link href="/#reference" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">Reference</Link></li>
              <li><Link href="/#faq" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">Časté dotazy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-8">{content.services}</h3>
            <ul className="space-y-4 text-sm font-bold text-white/70">
              <li className="uppercase tracking-wider">Podřezání diamantovým lanem</li>
              <li className="uppercase tracking-wider">Podřezání řetězovou pilou</li>
              <li className="uppercase tracking-wider">Izolace základů</li>
              <li className="uppercase tracking-wider">Chemická injektáž</li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-8">{content.contact}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="tel:+420123456789" className="text-white/70 hover:text-white transition-colors font-bold">+420 123 456 789</a>
              </li>
              <li className="flex items-start gap-3 group">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@izodiamant.cz" className="text-white/70 hover:text-white transition-colors font-bold">info@izodiamant.cz</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm leading-relaxed">
                  Technická ulice 1<br />
                  100 00 Praha 10<br />
                  Česká republika
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <p>&copy; {currentYear} IZO<span className="text-primary/50">DIAMANT</span>. {content.rights}</p>
          <div className="flex gap-8">
            <Link href="/ochrana-udaju" className="hover:text-primary transition-colors">{content.privacy}</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">{content.cookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

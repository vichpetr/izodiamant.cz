import Link from 'next/link';
import { Phone, Mail, MapPin, User, FileText } from 'lucide-react';
import Image from 'next/image';

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
            <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105">
              <div className="relative w-10 h-10 shrink-0">
                <Image 
                  src="/logo.png"
                  alt="IZODIAMANT"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-xl text-white tracking-tighter uppercase">
                  IZO<span className="text-primary">DIAMANT</span>
                </span>
                <span className="text-[10px] font-bold text-white/60 tracking-[0.2em] uppercase pl-1">
                  Sanace zdiva
                </span>
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed pt-2">
              {content.desc}
            </p>
            <div className="pt-4 space-y-3 border-t border-white/5">
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
                <User className="w-3 h-3 text-primary" />
                Václav Ropek
              </div>
              <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
                <FileText className="w-3 h-3 text-primary" />
                IČO: 74650726
              </div>
            </div>
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
            <ul className="space-y-4 text-sm font-bold">
              <li>
                <Link href="/sluzby/diamantove-lano" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">
                  Podřezání diamantovým lanem
                </Link>
              </li>
              <li>
                <Link href="/sluzby/retezova-pila" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">
                  Podřezání řetězovou pilou
                </Link>
              </li>
              <li>
                <Link href="/sluzby/chemicka-injektaz" className="text-white/70 hover:text-primary transition-colors uppercase tracking-wider">
                  Chemická injektáž
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-primary font-bold uppercase tracking-widest text-sm mb-8">{content.contact}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col gap-1">
                  <a href="tel:+420737017012" className="text-white/70 hover:text-white transition-colors font-bold">+420 737 017 012</a>
                  <a href="tel:+420732902754" className="text-white/70 hover:text-white transition-colors font-bold">+420 732 902 754</a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@izodiamant.cz" className="text-white/70 hover:text-white transition-colors font-bold">info@izodiamant.cz</a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-white/50 text-sm leading-relaxed font-bold uppercase tracking-tight">
                  Mokrá Lhota 26<br />
                  539 44 Nové Hrady
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <p>&copy; {currentYear} IZODIAMANT. {content.rights}</p>
          <div className="flex gap-8">
            <Link href="/ochrana-udaju" className="hover:text-primary transition-colors">{content.privacy}</Link>
            <Link href="/cookies" className="hover:text-primary transition-colors">{content.cookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: 'Diamantové lano', href: '/sluzby/diamantove-lano' },
    { name: 'Řetězová pila', href: '/sluzby/retezova-pila' },
    { name: 'Chemická injektáž', href: '/sluzby/chemicka-injektaz' },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-40 transition-all duration-300 border-b border-transparent',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-neutral-light/50'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-neutral-dark font-black text-xl group-hover:scale-105 transition-transform shadow-sm">
              IZ
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-xl text-neutral-dark tracking-tighter uppercase">
                IZO<span className="text-primary">DIAMANT</span>
              </span>
              <span className="text-[10px] font-bold text-neutral-dark/60 tracking-[0.2em] uppercase pl-1">
                Sanace zdiva
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div 
              className="relative group py-8"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button className="flex items-center gap-1 text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
                Služby
                <ChevronDown className={cn("w-4 h-4 transition-transform", isServicesOpen && "rotate-180")} />
              </button>
              
              <div className={cn(
                "absolute top-full left-0 w-64 bg-white shadow-xl rounded-2xl border border-neutral-light overflow-hidden transition-all duration-200 origin-top-left",
                isServicesOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
              )}>
                {services.map((service) => (
                  <Link 
                    key={service.href} 
                    href={service.href}
                    className="block px-6 py-4 text-sm font-bold uppercase tracking-wider text-neutral-dark/70 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/#calculator" className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              Ceník & Kalkulačka
            </Link>
            <Link href="/#reference" className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              Reference
            </Link>
            <Link href="/#faq" className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+420737017012" className="flex items-center gap-2 text-neutral-dark font-bold hover:text-primary transition-colors">
              <Phone className="w-4 h-4 text-primary" />
              <span>+420 737 017 012</span>
            </a>
            <Link href="/#calculator" className="btn-primary py-2 px-6">
              Spočítat cenu
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-dark hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-light absolute w-full left-0 shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <div className="py-2">
              <div className="px-3 py-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">Naše služby</div>
              {services.map((service) => (
                <Link 
                  key={service.href} 
                  href={service.href} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-3 py-3 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md"
                >
                  {service.name}
                </Link>
              ))}
            </div>
            
            <div className="border-t border-neutral-light my-2" />

            <Link href="/#calculator" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              Ceník & Kalkulačka
            </Link>
            <Link href="/#reference" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              Reference
            </Link>
            <Link href="/#faq" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              FAQ
            </Link>
            <div className="pt-4 flex flex-col gap-3">
              <a href="tel:+420737017012" className="flex items-center justify-center gap-2 px-3 py-4 text-neutral-dark font-bold border-2 border-primary rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <span>+420 737 017 012</span>
              </a>
              <Link href="/#calculator" onClick={() => setIsMobileMenuOpen(false)} className="text-center btn-primary py-4">
                Spočítat cenu
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

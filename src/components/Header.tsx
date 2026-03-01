'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header({ lang }: { lang: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const content = {
    cs: {
      tech: "Technologie",
      calc: "Ceník & Kalkulačka",
      ref: "Reference",
      faq: "FAQ",
      cta: "Spočítat cenu",
    },
    en: {
      tech: "Technology",
      calc: "Pricing & Calculator",
      ref: "References",
      faq: "FAQ",
      cta: "Calculate Price",
    },
  }[lang as "cs" | "en"] || {
    tech: "Technologie",
    calc: "Ceník & Kalkulačka",
    ref: "Reference",
    faq: "FAQ",
    cta: "Spočítat cenu",
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
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
            <Link href={`/${lang}#technologie`} className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              {content.tech}
            </Link>
            <Link href={`/${lang}#calculator`} className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              {content.calc}
            </Link>
            <Link href={`/${lang}#reference`} className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              {content.ref}
            </Link>
            <Link href={`/${lang}#faq`} className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              {content.faq}
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+420123456789" className="flex items-center gap-2 text-neutral-dark font-bold hover:text-primary transition-colors">
              <Phone className="w-4 h-4 text-primary" />
              <span>+420 123 456 789</span>
            </a>
            <Link
              href={`/${lang}#calculator`}
              className="btn-primary py-2 px-6"
            >
              {content.cta}
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
        <div className="md:hidden bg-white border-t border-neutral-light absolute w-full left-0 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link href={`/${lang}#technologie`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              {content.tech}
            </Link>
            <Link href={`/${lang}#calculator`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              {content.calc}
            </Link>
            <Link href={`/${lang}#reference`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              {content.ref}
            </Link>
            <Link href={`/${lang}#faq`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              {content.faq}
            </Link>
            <div className="pt-4 flex flex-col gap-3">
              <a href="tel:+420123456789" className="flex items-center justify-center gap-2 px-3 py-4 text-neutral-dark font-bold border-2 border-primary rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
                <span>+420 123 456 789</span>
              </a>
              <Link href={`/${lang}#calculator`} onClick={() => setIsMobileMenuOpen(false)} className="text-center btn-primary py-4">
                {content.cta}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

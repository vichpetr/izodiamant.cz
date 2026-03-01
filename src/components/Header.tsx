'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // On homepage, we want transparent header at top. On subpages, we want it always solid.
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    // Check immediately on mount
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 w-full z-40 transition-all duration-300 border-b',
        (isScrolled || !isHomepage)
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-neutral-light/50 py-3'
          : 'bg-transparent border-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#technologie" className="text-neutral-dark/80 hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
              Technologie
            </Link>
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

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+420737017012" className="flex items-center gap-2 text-neutral-dark font-bold hover:text-primary transition-colors">
              <Phone className="w-4 h-4 text-primary" />
              <span>+420 737 017 012</span>
            </a>
            <Link
              href="/#calculator"
              className="btn-primary py-2 px-6"
            >
              Spočítat cenu
            </Link>
          </div>

          {/* Mobile menu button */}
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
            <Link href="/#technologie" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-4 text-base font-bold text-neutral-dark uppercase tracking-widest hover:bg-neutral-light rounded-md">
              Technologie
            </Link>
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

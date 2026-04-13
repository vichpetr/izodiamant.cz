'use client';

import Link from 'next/link';
import { m } from 'framer-motion';
import { Icons } from '@/components/Icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-dark text-white flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center relative overflow-hidden py-32">
        {/* Background elements to match the site design */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-32" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-12 transform -rotate-12 border border-primary/20">
              <Icons.Zap className="w-12 h-12 text-primary" />
            </div>
            
            <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter mb-6 leading-none">
              404
            </h1>
            
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tight mb-8 text-primary">
              Tuto stránku jsme <br className="sm:hidden" /> odřízli!
            </h2>
            
            <p className="text-xl text-white/60 font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              Omlouváme se, ale tato stránka v našem novém domě už nemá místo. 
              Zřejmě ji potkal stejný osud jako vlhké zdivo – 
              prostě jsme ji <strong>definitivně odstranili.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="/" 
                className="btn-primary py-4 px-10 w-full sm:w-auto"
              >
                Zpět na hlavní stranu
              </Link>
              <Link 
                href="/#sluzby" 
                className="text-white hover:text-primary font-black uppercase tracking-widest text-sm transition-colors border-2 border-white/10 hover:border-primary/50 py-4 px-10 rounded-xl w-full sm:w-auto"
              >
                Naše technologie
              </Link>
            </div>
          </m.div>

          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center"
          >
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">
              Hledali jste něco jiného?
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <Link href="/#reference" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Reference</Link>
              <Link href="/#calculator" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Ceník</Link>
              <Link href="/#contact" className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">Kontakt</Link>
            </div>
          </m.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

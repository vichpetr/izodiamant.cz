'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero({ lang }: { lang: string }) {
  const content = {
    cs: {
      badge: "Technologie 'Technical Trust' 2026",
      h1: "Váš dům si zaslouží suché základy. Navždy.",
      desc: "Profesionální sanace a podřezávání zdiva nejmodernější technologií. Od cihel po tvrdý kámen – vracíme zdraví vaší stavbě s doživotní zárukou.",
      cta_calc: "Spočítat cenu online",
      cta_ref: "Naše reference",
    },
    en: {
      badge: "Technical Trust Technology 2026",
      h1: "Your house deserves dry foundations. Forever.",
      desc: "Professional remediation and masonry cutting with cutting-edge technology. From bricks to hard stone – we restore your building's health with a lifetime guarantee.",
      cta_calc: "Calculate price online",
      cta_ref: "Our references",
    },
  }[lang as "cs" | "en"] || {
    badge: "Technologie 'Technical Trust' 2026",
    h1: "Váš dům si zaslouží suché základy. Navždy.",
    desc: "Profesionální sanace a podřezávání zdiva nejmodernější technologií. Od cihel po tvrdý kámen – vracíme zdraví vaší stavbě s doživotní zárukou.",
    cta_calc: "Spočítat cenu online",
    cta_ref: "Naše reference",
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-neutral-light">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-light z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="w-full h-full opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-neutral-dark text-xs font-black uppercase tracking-[0.2em] mb-8 border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {content.badge}
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-neutral-dark tracking-tighter mb-8 text-balance uppercase italic leading-[0.9]">
            {content.h1.split('. ')[0]}. <br className="hidden sm:block" />
            <span className="text-primary">{content.h1.split('. ')[1]}</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-dark/70 mb-12 text-balance font-medium leading-relaxed">
            {content.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${lang}#calculator`}
              className="w-full sm:w-auto btn-primary py-4 px-10 text-lg uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
            >
              {content.cta_calc}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href={`/${lang}#reference`}
              className="w-full sm:w-auto btn-outline py-4 px-10 text-lg uppercase tracking-widest flex items-center justify-center gap-3 group border-neutral-dark/20 text-neutral-dark hover:bg-neutral-dark hover:text-white"
            >
              <PlayCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              {content.cta_ref}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

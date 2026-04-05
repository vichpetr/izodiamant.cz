'use client';

import { useState, useRef } from 'react';
import { m } from 'framer-motion';
import Link from 'next/link';
import { Icons } from './Icons';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import referencesData from '@/data/references.json';

export default function References() {
  const [showAll, setShowAll] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const content = {
    h2: "Naše reference.",
    h3: "Desítky suchých domů",
    sub: "Podívejte se na detaily našich realizací. Od historických sklepů po moderní rodinné domy.",
    cta_more: "Zobrazit další reference",
    cta_less: "Zobrazit méně",
  };

  // Sort references by date (newest first)
  const sortedReferences = [...referencesData].sort((a, b) => b.date.localeCompare(a.date));
  
  // Render all for SEO but control visibility
  const visibleReferences = sortedReferences;

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const months = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const handleToggle = () => {
    if (showAll) {
      setShowAll(false);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAll(true);
    }
  };

  return (
    <section id="reference" ref={sectionRef} className="py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-neutral-dark mb-2 uppercase tracking-tighter italic">
            {content.h2}
          </h2>
          <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight italic mb-6">
            {content.h3}
          </h3>
          <p className="text-lg text-neutral-dark/60 font-medium">
            {content.sub}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {visibleReferences.map((project, index) => (
            <m.div
              key={project.id}
              initial={index < 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={showAll || index < 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: showAll && index >= 3 ? (index - 3) * 0.1 : 0 }}
              className={cn(
                "group",
                !showAll && index >= 3 && "hidden md:hidden lg:hidden" // Purely for visual hiding, but will be in DOM during SSR
              )}
            >
              <Link href={`/reference/${project.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-dark text-foreground">
                  <Image 
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="bg-primary/90 backdrop-blur-md text-neutral-dark px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg">
                      <Icons.Calendar className="w-3 h-3" />
                      {formatDate(project.date)}
                    </div>
                    {(project as any).reviewId && (
                      <div className="bg-white/90 backdrop-blur-md text-neutral-dark px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-2 w-fit shadow-lg border border-primary/20">
                        <Icons.CheckCircle2 className="w-3 h-3 text-primary" />
                        Ověřená reference
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                      <Icons.Diamond className="w-3 h-3" />
                      {project.technology}
                    </div>
                    <div className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4 group-hover:text-primary transition-colors">
                      {project.title}
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                      <Icons.MapPin className="w-3 h-3 text-primary" />
                      {project.location}
                    </div>
                  </div>

                  <div className="absolute top-8 right-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-neutral-dark transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <Icons.ArrowUpRight className="w-6 h-6" />
                  </div>
                </Link>
              </m.div>
            ))}
        </div>

        {referencesData.length > 3 && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16"
          >
            <button
              onClick={handleToggle}
              className="btn-outline py-4 px-10 text-lg uppercase tracking-widest flex items-center gap-3 mx-auto group border-neutral-dark/10 text-neutral-dark/60 hover:border-primary hover:text-primary transition-all"
            >
              {showAll ? content.cta_less : content.cta_more}
              {showAll ? (
                <Icons.ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
              ) : (
                <Icons.ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              )}
            </button>
          </m.div>
        )}
      </div>
    </section>
  );
}

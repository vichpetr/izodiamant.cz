'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, ArrowUpRight, Diamond, Calendar } from 'lucide-react';
import referencesData from '@/data/references.json';

export default function References() {
  const content = {
    h2: "Naše reference.",
    h3: "500+ suchých domů",
    sub: "Podívejte se na detaily našich realizací. Od historických sklepů po moderní rodinné domy.",
  };

  // Sort references by date (newest first)
  const sortedReferences = [...referencesData].sort((a, b) => b.date.localeCompare(a.date));

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const months = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <section id="reference" className="py-24 bg-white">
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
          {sortedReferences.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/reference/${project.id}`} className="block relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-dark text-foreground">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark via-transparent to-transparent opacity-80" />
                
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className="bg-primary/90 backdrop-blur-md text-neutral-dark px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center gap-2 w-fit">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.date)}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-4">
                    <Diamond className="w-3 h-3" />
                    {project.technology}
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-3 h-3 text-primary" />
                    {project.location}
                  </div>
                </div>

                <div className="absolute top-8 right-8 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-neutral-dark transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import { motion } from 'framer-motion';
import { Gem, Zap, ShieldCheck } from 'lucide-react';

export default function Technology({ lang }: { lang: string }) {
  const content = {
    cs: {
      h2: "Sanace pro 21. století: Žádné kompromisy, jen čistý řez.",
      sub: "Využíváme špičkové vybavení, abychom zaručili precizní výsledek bez ohrožení statiky vaší nemovitosti.",
      tech1_title: "Diamantové lano – Král mezi technologiemi",
      tech1_desc: "Tam, kde ostatní končí, my začínáme. Technologie diamantového lana umožňuje řezat i ty nejnáročnější materiály bez otřesů, které by ohrozily statiku vašeho domu.",
      tech1_features: ['Pro kámen, beton i smíšené zdivo', 'Milimetrová přesnost', 'Bez limitu tloušťky zdi'],
      tech2_title: "Řetězová pila – Rychlost a efektivita",
      tech2_desc: "Ideální řešení pro cihelné zdivo. Rychlý postup a okamžité vložení hydroizolace zajišťují suchý domov v řádu dnů, nikoliv týdnů.",
      tech2_features: ['Ideální pro cihlové zdivo', 'Extrémně rychlý postup', 'Minimální zásah do provozu'],
      tech3_title: "Chemická injektáž – Bezhlučná clona",
      tech3_desc: "Moderní metoda vytvoření dodatečné hydroizolační clony pomocí speciálních gelů a pryskyřic. Vhodné tam, kde nelze fyzicky řezat.",
      tech3_features: ['Bezhlučný proces', 'Vysoce účinné gely', 'Šetrné ke zdivu'],
    },
    en: {
      h2: "Remediation for the 21st Century: No compromises, just a clean cut.",
      sub: "We use top-of-the-line equipment to guarantee a precise result without compromising the stability of your property.",
      tech1_title: "Diamond Wire – The King of Technologies",
      tech1_desc: "Where others end, we begin. Diamond wire technology allows cutting even the most demanding materials without vibrations that would threaten your home's stability.",
      tech1_features: ['For stone, concrete, and mixed masonry', 'Millimeter precision', 'No limit on wall thickness'],
      tech2_title: "Chain Saw – Speed and Efficiency",
      tech2_desc: "An ideal solution for brick masonry. Fast progress and immediate insertion of hydro-insulation ensure a dry home in days, not weeks.",
      tech2_features: ['Ideal for brick masonry', 'Extremely fast progress', 'Minimal interference with operations'],
      tech3_title: "Chemical Injection – Silent Barrier",
      tech3_desc: "A modern method of creating an additional hydro-insulation barrier using special gels and resins. Suitable where physical cutting is not possible.",
      tech3_features: ['Noiseless process', 'Highly effective gels', 'Gentle on masonry'],
    },
  }[lang as "cs" | "en"] || {
    h2: "Sanace pro 21. století: Žádné kompromisy, jen čistý řez.",
    sub: "Využíváme špičkové vybavení, abychom zaručili precizní výsledek bez ohrožení statiky vaší nemovitosti.",
    tech1_title: "Diamantové lano – Král mezi technologiemi",
    tech1_desc: "Tam, kde ostatní končí, my začínáme. Technologie diamantového lana umožňuje řezat i ty nejnáročnější materiály bez otřesů, které by ohrozily statiku vašeho domu.",
    tech1_features: ['Pro kámen, beton i smíšené zdivo', 'Milimetrová přesnost', 'Bez limitu tloušťky zdi'],
    tech2_title: "Řetězová pila – Rychlost a efektivita",
    tech2_desc: "Ideální řešení pro cihelné zdivo. Rychlý postup a okamžité vložení hydroizolace zajišťují suchý domov v řádu dnů, nikoliv týdnů.",
    tech2_features: ['Ideální pro cihlové zdivo', 'Extrémně rychlý postup', 'Minimální zásah do provozu'],
    tech3_title: "Chemická injektáž – Bezhlučná clona",
    tech3_desc: "Moderní metoda vytvoření dodatečné hydroizolační clony pomocí speciálních gelů a pryskyřic. Vhodné tam, kde nelze fyzicky řezat.",
    tech3_features: ['Bezhlučný proces', 'Vysoce účinné gely', 'Šetrné ke zdivu'],
  };

  const technologies = [
    {
      icon: Gem,
      title: content.tech1_title,
      description: content.tech1_desc,
      features: content.tech1_features,
    },
    {
      icon: Zap,
      title: content.tech2_title,
      description: content.tech2_desc,
      features: content.tech2_features,
    },
    {
      icon: ShieldCheck,
      title: content.tech3_title,
      description: content.tech3_desc,
      features: content.tech3_features,
    }
  ];

  return (
    <section id="technologie" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-dark mb-6 uppercase tracking-tighter italic">
            {content.h2}
          </h2>
          <p className="text-lg text-neutral-dark/60 font-medium">
            {content.sub}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-neutral-light p-10 rounded-2xl border-2 border-transparent hover:border-primary transition-all group"
            >
              <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-xl mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-primary/20">
                <tech.icon className="w-8 h-8 text-neutral-dark" />
              </div>
              <h3 className="text-2xl font-black text-neutral-dark mb-6 uppercase tracking-tight leading-tight">
                {tech.title}
              </h3>
              <p className="text-neutral-dark/70 mb-8 font-medium leading-relaxed">
                {tech.description}
              </p>
              <ul className="space-y-4">
                {tech.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3 text-sm text-neutral-dark font-black uppercase tracking-wider">
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

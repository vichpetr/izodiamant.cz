'use client';

import { m } from 'framer-motion';
import { Icons } from './Icons';
import Link from 'next/link';

export default function Technology() {
  const content = {
    h2: "Žádné kompromisy, jen čistý řez.",
    h3: "Sanace pro 21. století",
    sub: "Využíváme špičkové vybavení, abychom zaručili precizní výsledek bez ohrožení statiky vaší nemovitosti.",
    tech1_title: "Diamantové lano",
    tech1_desc: "Technologie diamantového lana umožňuje řezat i ty nejnáročnější materiály bez otřesů, které by ohrozily statiku vašeho domu.",
    tech1_features: ['Pro kámen, beton i smíšené zdivo', 'Milimetrová přesnost', 'Bez limitu tloušťky zdi'],
    tech1_href: '/sluzby/diamantove-lano',
    
    tech2_title: "Řetězová pila",
    tech2_desc: "Ideální řešení pro cihelné zdivo. Rychlý postup a okamžité vložení hydroizolace zajišťují suchý domov v řádu dnů, nikoliv týdnů.",
    tech2_features: ['Ideální pro cihlové zdivo', 'Extrémně rychlý postup', 'Minimální zásah do provozu'],
    tech2_href: '/sluzby/retezova-pila',

    tech3_title: "Chemická injektáž",
    tech3_desc: "Moderní metoda vytvoření dodatečné hydroizolační clony pomocí speciálních gelů a pryskyřic. Vhodné tam, kde nelze fyzicky řezat.",
    tech3_features: ['Bezhlučný proces', 'Vysoce účinné gely', 'Šetrné ke zdivu'],
    tech3_href: '/sluzby/chemicka-injektaz',
  };

  const technologies = [
    {
      icon: Icons.Gem,
      title: content.tech1_title,
      description: content.tech1_desc,
      features: content.tech1_features,
      href: content.tech1_href,
    },
    {
      icon: Icons.Zap,
      title: content.tech2_title,
      description: content.tech2_desc,
      features: content.tech2_features,
      href: content.tech2_href,
    },
    {
      icon: Icons.ShieldCheck,
      title: content.tech3_title,
      description: content.tech3_desc,
      features: content.tech3_features,
      href: content.tech3_href,
    }
  ];

  return (
    <section id="technologie" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-neutral-dark uppercase tracking-tighter italic mb-2">
            {content.h2}
          </h2>
          <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight italic mb-6">
            {content.h3}
          </h3>
          <p className="text-lg text-neutral-dark/60 font-medium">
            {content.sub}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {technologies.map((tech, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-neutral-light p-10 rounded-2xl border-2 border-transparent hover:border-primary transition-all group flex flex-col h-full"
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
              <ul className="space-y-4 mb-10">
                {tech.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3 text-sm text-neutral-dark font-black uppercase tracking-wider">
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="mt-auto">
                <Link 
                  href={tech.href}
                  className="inline-flex items-center gap-2 text-neutral-dark font-black uppercase tracking-widest text-xs hover:text-primary transition-colors group/link"
                  aria-label={`Více o technologii ${tech.title.split(' – ')[0].toLowerCase()}`}
                >
                  Více o technologii
                  <Icons.ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}

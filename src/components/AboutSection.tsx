'use client';

import React from 'react';
import { m } from 'framer-motion';
import { Icons } from './Icons';

export default function AboutSection() {
  const points = [
    {
      title: "Odbornost a zkušenosti",
      text: "Specializujeme se výhradně na sanace a izolace zdiva. Naše letitá praxe v oboru nám umožňuje navrhovat řešení, která skutečně fungují a vyřeší problém s vlhkostí jednou provždy."
    },
    {
      title: "Nejmodernější vybavení",
      text: "Disponujeme špičkovou technikou pro diamantové řezání i strojní podřezávání řetězovou pilou. Díky tomu jsme schopni pracovat čistě, rychle a s milimetrovou přesností i v náročných podmínkách."
    },
    {
      title: "Individuální přístup",
      text: "Každá stavba je unikátní. Proto vždy začínáme důkladnou prohlídkou objektu a diagnostikou příčin vlhkosti, na jejímž základě navrhneme technologii přímo na míru vašemu domu."
    },
    {
      title: "Záruka kvality",
      text: "Za svou prací si stojíme. Používáme pouze certifikované izolační materiály s ověřenou životností. Naším cílem není jen 'oprava', ale kompletní navrácení zdraví vaší stavbě."
    }
  ];

  return (
    <section className="py-24 bg-neutral-dark text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-32" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-8 leading-tight">
              Proč svěřit sanaci <br />
              <span className="text-primary">právě nám?</span>
            </h2>
            <div className="space-y-6 text-lg text-white/70 font-medium leading-relaxed">
              <p>
                Jsme ryze česká firma zaměřená na profesionální řešení vlhkosti v objektech všech typů. Od historických kamenných staveb přes rodinné domy ze smíšeného zdiva až po moderní průmyslové haly – tam všude vracíme zdraví vaší stavbě.
              </p>
              <p>
                Chápeme, že vlhkost není jen estetický problém, ale vážná hrozba pro statiku domu a zdraví jeho obyvatel. Proto ke každé zakázce přistupujeme s maximální zodpovědností a využíváme postupy, které jsou prověřené dekádami v oboru sanací.
              </p>
              <p>
                Působíme po celém území České republiky a díky naší mobilitě jsme schopni realizovat zakázky v krátkých termínech. Naše cena je vždy konečná a transparentní, bez skrytých poplatků.
              </p>
            </div>
          </m.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {points.map((point, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/30 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition-colors">
                  <Icons.CheckCircle2 className="w-5 h-5 text-primary group-hover:text-neutral-dark" />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-4 text-white group-hover:text-primary transition-colors">
                  {point.title}
                </h3>
                <p className="text-sm text-white/50 font-medium leading-relaxed">
                  {point.text}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

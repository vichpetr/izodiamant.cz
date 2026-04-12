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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight md:tracking-tighter italic mb-8 leading-tight px-2">
              Proč svěřit sanaci <br />
              <span className="text-primary">vašeho domu nám?</span>
            </h2>
            <div className="prose prose-lg text-white/70 font-medium leading-relaxed mb-12 max-w-2xl px-2">
              <p>
                <strong>Sanace a podřezávání zdiva</strong> je zásadní investicí do budoucnosti vaší nemovitosti. Vlhké zdivo nejen zhoršuje tepelně-izolační vlastnosti domu, ale vede k rozvoji plísní a postupné degradaci stavebních materiálů. Naše firma se specializuje na kompletní odstranění těchto problémů pomocí certifikovaných technologií s dlouhou životností.
              </p>
              <p>
                Jsme ryze česká firma <strong>IZODIAMANT</strong> zaměřená na profesionální a <strong>komplexní</strong> řešení vlhkosti v objektech všech typů. Od historických kamenných staveb přes rodinné domy ze smíšeného zdiva až po moderní průmyslové haly – tam všude <strong>vracíme zdraví vaší stavbě.</strong> Věříme, že každý <strong>dům si zaslouží</strong> spolehlivou ochranu, která vydrží <strong>navždy</strong>. Naše specializace na <strong>podřezávání zdiva</strong> a <strong>komplexní sanace vlhkého zdiva</strong> nás řadí mezi špičku v oboru v rámci celé České republiky.
              </p>
              <p>
                Chápeme, že vlhkost není jen estetický problém, ale vážná hrozba pro statiku domu a zdraví jeho obyvatel. Vzlínající vlhkost v konstrukcích způsobuje degradaci materiálů, vznik plísní a výrazně zvyšuje náklady na vytápění. Proto ke každé zakázce přistupujeme s maximální zodpovědností a využíváme postupy, které jsou prověřené dekádami v oboru sanací. Naše technologie, jako je <strong>podřezávání diamantovým lanem</strong> nebo strojní řezání řetězovou pilou, představují definitivní řešení pro suchý a bezpečný domov.
              </p>
              <p>
                Působíme po celém území České republiky – od Prahy přes Brno až po nejmenší obce. Díky naší mobilitě a vlastnímu strojovému parku jsme schopni realizovat zakázky v krátkých termínech a s garantovanou kvalitou. Naše cena za metr podřezání zdiva je vždy konečná a transparentní, bez jakýchkoliv skrytých poplatků, což potvrzují stovky spokojených zákazníků po celé zemi. <strong>IZODIAMANT</strong> je synonymem pro suchý dům a zdravé bydlení.
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
                <div className="text-xl font-black uppercase italic mb-4 text-white group-hover:text-primary transition-colors">
                  {point.title}
                </div>
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

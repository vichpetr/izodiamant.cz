'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

export default function FAQ() {
  const content = {
    h2: "Máte otázky? My máme řešení.",
    sub: "Vše, co potřebujete vědět před zahájením sanace.",
    faqs: [
      {
        question: 'Práší se při podřezávání v interiéru?',
        answer: 'Díky modernímu odsávání a technologii vodního chlazení diamantového lana minimalizujeme prašnost na minimum. Většina prací probíhá bez nutnosti opustit nemovitost. Prostor vždy pečlivě zakrýváme.'
      },
      {
        question: 'Jak dlouho trvá sanace průměrného rodinného domu?',
        answer: 'Standardní rodinný dům podřežeme a izolujeme během 2–4 pracovních dnů v závislosti na zvolené technologii, přístupnosti a celkové tloušťce zdiva.'
      },
      {
        question: 'Může dojít k narušení statiky domu?',
        answer: 'Ne. Postupujeme po malých úsecích (tzv. "na střídačku") a do vzniklé spáry okamžitě vkládáme hydroizolaci a speciální statické klíny. Následně se spára tlakově vyplní cementovou směsí. Statika domu je 100% zajištěna.'
      },
      {
        question: 'Poskytujete záruku na provedené práce?',
        answer: 'Ano, na vloženou hydroizolaci a funkčnost podřezání poskytujeme prodlouženou záruku. Díky použití vysoce kvalitních PE folií a sklolaminátových desek je životnost izolace prakticky doživotní.'
      }
    ]
  };

  return (
    <section id="faq" className="py-24 bg-neutral-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-neutral-dark mb-6 uppercase tracking-tighter italic">
            {content.h2}
          </h2>
          <p className="text-lg text-neutral-dark/60 font-medium">
            {content.sub}
          </p>
        </div>

        <div className="space-y-4">
          {content.faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-2 border-transparent hover:border-primary/20 rounded-2xl overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="font-black text-neutral-dark uppercase tracking-tight pr-4">{question}</span>
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center text-primary transition-transform shadow-inner">
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-8 pb-8 text-neutral-dark/70 font-medium leading-relaxed border-t border-neutral-light pt-6">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

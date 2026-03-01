'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Material = 'Cihla' | 'Kámen' | 'Smíšené' | 'Beton';

export default function PricingCalculator() {
  const [material, setMaterial] = useState<Material>('Cihla');
  const [thickness, setThickness] = useState<number>(45);
  const [length, setLength] = useState<number>(10);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const content = {
    h2: "Spočítejte si cenu sanace",
    sub: "Získejte okamžitý odhad nákladů pro váš projekt v jednom kroku.",
    material_label: "1. Typ zdiva",
    thickness_label: "2. Tloušťka zdiva",
    length_label: "3. Rozsah prací (délka)",
    price_est: "Orientační cena bez DPH",
    cta: "Odeslat nezávaznou poptávku",
    success_h3: "Poptávka odeslána!",
    success_p: "Děkujeme. Brzy se vám ozveme s detailním rozpisem.",
    materials: {
      'Cihla': 'Nejčastější, rychlý postup.',
      'Kámen': 'Vyžaduje diamantové lano.',
      'Smíšené': 'Kombinace materiálů.',
      'Beton': 'Extrémně tvrdý materiál.',
    }
  };

  const calculateEstimate = () => {
    let basePrice = 1500;
    if (material === 'Kámen') basePrice = 2500;
    if (material === 'Smíšené') basePrice = 2000;
    if (material === 'Beton') basePrice = 3000;

    const thicknessFactor = thickness / 45;
    return Math.round(basePrice * thicknessFactor * length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          material,
          thickness,
          length,
          price: calculateEstimate(),
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Něco se nepovedlo. Zkuste to prosím znovu.');
      }
    } catch {
      alert('Chyba při odesílání.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="calculator" className="py-24 bg-neutral-dark relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Calculator className="w-10 h-10 text-primary" />
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">
              {content.h2}
            </h2>
          </div>
          <p className="text-lg text-white/60 font-medium max-w-2xl mx-auto">
            {content.sub}
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/10 p-8 md:p-12 shadow-2xl">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form 
                key="calc-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="grid lg:grid-cols-2 gap-16"
              >
                <div className="space-y-12">
                  <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">{content.material_label}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(['Cihla', 'Kámen', 'Smíšené', 'Beton'] as Material[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMaterial(m)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all group",
                            material === m 
                              ? "border-primary bg-primary/10" 
                              : "border-white/10 hover:border-white/30"
                          )}
                        >
                          <div className={cn("font-black text-lg uppercase tracking-tight mb-1", material === m ? "text-primary" : "text-white")}>{m}</div>
                          <div className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                            {content.materials[m]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">{content.thickness_label}</h3>
                        <span className="text-3xl font-black text-white italic">{thickness} <span className="text-sm font-bold text-white/40 not-italic uppercase tracking-widest ml-1">cm</span></span>
                      </div>
                      <input 
                        type="range" 
                        min="15" max="150" step="5"
                        value={thickness}
                        onChange={(e) => setThickness(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">{content.length_label}</h3>
                        <span className="text-3xl font-black text-white italic">{length} <span className="text-sm font-bold text-white/40 not-italic uppercase tracking-widest ml-1">m</span></span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="100" step="1"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="bg-primary/10 rounded-2xl p-10 border-2 border-primary/20 text-center mb-10 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">{content.price_est}</div>
                      <div className="text-6xl md:text-7xl font-black text-white italic tracking-tighter mb-4">
                        ~ {calculateEstimate().toLocaleString('cs-CZ')} <span className="text-2xl not-italic font-bold text-white/40">Kč</span>
                      </div>
                      <p className="text-xs text-white/40 font-bold uppercase tracking-widest">
                        {material}, {thickness}cm tloušťka, {length}m délka
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vas@email.cz"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                    />
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full btn-primary py-5 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Odesílám...' : content.cta}
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success" 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-24 h-24 bg-primary text-neutral-dark rounded-full flex items-center justify-center mb-10 shadow-xl shadow-primary/20">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6">{content.success_h3}</h3>
                <p className="text-xl text-white/60 font-medium max-w-md mx-auto mb-12">
                  {content.success_p}
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)} 
                  className="btn-outline text-white border-white/20 hover:bg-white/10"
                >
                  Nová kalkulace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

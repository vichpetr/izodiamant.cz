'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import calculatorData from '@/data/calculator.json';

interface Service {
  id: string;
  label: string;
  minPrice: number;
  maxPrice: number;
  unit: string;
}

interface Material {
  id: string;
  label: string;
  description: string;
  availableServices: Service[];
}

export default function PricingCalculator() {
  const [materialId, setMaterialId] = useState<string>(calculatorData[0].id);
  const [serviceId, setServiceId] = useState<string>(calculatorData[0].availableServices[0].id);
  const [thickness, setThickness] = useState<number>(45);
  const [length, setLength] = useState<number>(10);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Profile check
  const profileUrl = process.env.NEXT_PUBLIC_FIRMY_PROFILE_URL;
  if (!profileUrl) throw new Error("NEXT_PUBLIC_FIRMY_PROFILE_URL missing");

  // Selection logic
  const selectedMaterial = useMemo(() => 
    (calculatorData as Material[]).find(m => m.id === materialId)!, 
  [materialId]);

  const selectedService = useMemo(() => 
    selectedMaterial.availableServices.find(s => s.id === serviceId) || selectedMaterial.availableServices[0],
  [selectedMaterial, serviceId]);

  // Reset service if not available in new material
  const handleMaterialChange = (id: string) => {
    setMaterialId(id);
    const newMaterial = (calculatorData as Material[]).find(m => m.id === id)!;
    setServiceId(newMaterial.availableServices[0].id);
  };

  const calculateRange = () => {
    const isM2 = selectedService.unit === 'm2';
    const factor = isM2 ? (thickness / 100) * length : length;
    
    return {
      min: Math.round(selectedService.minPrice * factor),
      max: Math.round(selectedService.maxPrice * factor)
    };
  };

  const range = calculateRange();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          material: selectedMaterial.label,
          service: selectedService.label,
          thickness,
          length,
          price: `${range.min.toLocaleString()} - ${range.max.toLocaleString()} Kč`,
        }),
      });
      setIsSubmitted(true);
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
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
              Kalkulačka <br className="md:hidden" /> <span className="text-primary">ceny sanace</span>
            </h2>
          </div>
          <p className="text-lg text-white/60 font-medium max-w-2xl mx-auto">
            Získejte přesný odhad nákladů podle materiálu a zvolené technologie v jednom kroku.
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
                  {/* Step 1: Material */}
                  <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 italic">1. Typ zdiva</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {calculatorData.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleMaterialChange(m.id)}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all",
                            materialId === m.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"
                          )}
                        >
                          <div className={cn("font-black text-lg uppercase tracking-tight mb-1", materialId === m.id ? "text-primary" : "text-white")}>{m.label}</div>
                          <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest leading-tight">{m.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Service (Conditional) */}
                  <div>
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 italic">2. Zvolte technologii</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedMaterial.availableServices.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setServiceId(s.id)}
                          className={cn(
                            "px-6 py-3 rounded-full border-2 text-sm font-black uppercase tracking-widest transition-all",
                            serviceId === s.id ? "border-primary bg-primary text-neutral-dark" : "border-white/10 text-white/60 hover:border-white/30"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Dimensions */}
                  <div className="space-y-10">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] italic">3. Tloušťka zdiva</h3>
                        <span className="text-3xl font-black text-white italic">{thickness} <span className="text-sm font-bold text-white/40 not-italic uppercase tracking-widest ml-1">cm</span></span>
                      </div>
                      <input 
                        type="range" min="15" max="150" step="5" value={thickness}
                        onChange={(e) => setThickness(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] italic">4. Délka zdi</h3>
                        <span className="text-3xl font-black text-white italic">{length} <span className="text-sm font-bold text-white/40 not-italic uppercase tracking-widest ml-1">m</span></span>
                      </div>
                      <input 
                        type="range" min="1" max="100" step="1" value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="bg-primary/10 rounded-2xl p-10 border-2 border-primary/20 text-center mb-10 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 italic">Předběžné cenové rozpětí</div>
                      <div className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-4">
                        {range.min.toLocaleString()} – {range.max.toLocaleString()} <span className="text-xl not-italic font-bold text-white/40 uppercase">Kč</span>
                      </div>
                      <div className="inline-block px-4 py-1 bg-white/5 rounded-full text-[10px] text-white/40 font-black uppercase tracking-widest">
                        Bez DPH | {selectedService.label} | {thickness}cm tloušťka
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-[-8px] ml-2 italic">Váš e-mail pro detailní nabídku</label>
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="např. novak@seznam.cz"
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-5 outline-none focus:border-primary transition-colors text-white font-bold"
                    />
                    <button 
                      type="submit" disabled={isSubmitting}
                      className="w-full btn-primary py-6 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Odesílám...' : 'Poptat přesnou kalkulaci'}
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <p className="text-[10px] text-center text-white/30 font-bold uppercase tracking-widest pt-2 italic">
                      Cena je orientační. Konečnou nabídku určí náš technik po obhlídce.
                    </p>
                  </div>
                </div>
              </motion.form>
            ) : (
              <motion.div 
                key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
                className="flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-24 h-24 bg-primary text-neutral-dark rounded-full flex items-center justify-center mb-10 shadow-xl shadow-primary/20">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6 leading-none">Poptávka <br className="md:hidden" /> úspěšně odeslána!</h3>
                <p className="text-xl text-white/60 font-medium max-w-md mx-auto mb-12 leading-relaxed">
                  Děkujeme za váš zájem. Brzy se vám ozveme s detailním rozpisem prací.
                </p>
                <button onClick={() => setIsSubmitted(false)} className="btn-outline text-white border-white/20 hover:bg-white/10 py-4 px-10">
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

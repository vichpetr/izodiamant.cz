'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronRight, CheckCircle2, ArrowLeft, Send, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import calculatorData from '@/data/calculator.json';
import servicesData from '@/data/services.json';

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

interface FormErrors {
  name?: string;
  phone?: string;
}

export default function PricingCalculator() {
  const [step, setStep] = useState(1);
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [thickness, setThickness] = useState<number>(45);
  const [length, setLength] = useState<number>(10);
  
  // Contact info
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);

  // Selection logic
  const selectedMaterial = useMemo(() => 
    materialId ? (calculatorData as Material[]).find(m => m.id === materialId) : null
  , [materialId]);

  const selectedService = useMemo(() => 
    selectedMaterial ? selectedMaterial.availableServices.find(s => s.id === serviceId) : null
  , [selectedMaterial, serviceId]);

  const handleMaterialChange = (id: string) => {
    setMaterialId(id);
    setServiceId(null);
  };

  const calculateRange = () => {
    let candidates: Service[] = [];

    if (selectedService) {
      candidates = [selectedService];
    } else if (selectedMaterial) {
      candidates = selectedMaterial.availableServices;
    } else {
      (calculatorData as Material[]).forEach(m => {
        candidates.push(...m.availableServices);
      });
    }

    const prices: number[] = [];
    candidates.forEach(s => {
      const isM2 = s.unit === 'm2';
      const factor = isM2 ? (thickness / 100) * length : length;
      prices.push(s.minPrice * factor);
      prices.push(s.maxPrice * factor);
    });

    return {
      min: Math.round(Math.min(...prices)),
      max: Math.round(Math.max(...prices)),
      isFallback: !selectedService
    };
  };

  const range = calculateRange();

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Jméno je povinné';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon je povinný';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          material: selectedMaterial?.label || 'Nevybráno',
          service: selectedService?.label || 'Nevybráno (rozpětí všech variant)',
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

  const priceListTooltip = [
    { name: "Diamantové lano", price: servicesData["diamantove-lano"].priceRange.replace('m²', 'bm*'), href: "/sluzby/diamantove-lano" },
    { name: "Řetězová pila", price: servicesData["retezova-pila"].priceRange.replace('m²', 'bm*'), href: "/sluzby/retezova-pila" },
    { name: "Chemická injektáž", price: servicesData["chemicka-injektaz"].priceRange, href: "/sluzby/chemicka-injektaz" }
  ];

  return (
    <section id="calculator" ref={sectionRef} className="py-16 bg-neutral-dark relative overflow-hidden scroll-mt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 mb-4 relative group">
            <Calculator className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none">
              Kalkulačka <span className="text-primary">ceny sanace</span>
            </h2>
            
            {/* New Tooltip Position */}
            <div className="ml-2 relative">
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-primary hover:text-neutral-dark transition-all cursor-help border border-white/10 shrink-0">
                <Info className="w-3 h-3" />
              </div>
              
              <div className="absolute top-full right-[-40px] sm:right-auto sm:left-1/2 sm:-translate-x-1/2 pt-4 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 w-72 max-w-[85vw] z-50">
                <div className="bg-neutral-dark border-2 border-primary/30 p-5 rounded-2xl shadow-2xl backdrop-blur-xl text-left">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 italic border-b border-white/10 pb-2">Ceník</h4>
                  <div className="space-y-4">
                    {priceListTooltip.map((item, i) => (
                      <div key={i} className="flex justify-between items-center gap-4">
                        <Link href={item.href} className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 hover:text-primary uppercase leading-tight transition-colors">
                          {item.name}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                        <span className="text-[10px] font-black text-primary uppercase whitespace-nowrap">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/10 text-[8px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    * bm kalkulován při standardní tloušťce zdiva 45cm.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border-2 border-white/10 p-6 md:p-8 shadow-2xl relative">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key={step === 1 ? 'step1' : 'step2'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {step === 1 ? (
                  <div className="space-y-8">
                    <div className="grid lg:grid-cols-5 gap-10">
                      {/* Left Side: Inputs (60%) */}
                      <div className="lg:col-span-3 space-y-8">
                        {/* Stacked Dimensions */}
                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between items-end mb-3">
                              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">1. Tloušťka zdiva</h3>
                              <span className="text-2xl font-black text-white italic leading-none">{thickness} <span className="text-xs font-bold text-white/40 not-italic uppercase tracking-widest ml-1">cm</span></span>
                            </div>
                            <input type="range" min="15" max="150" step="5" value={thickness} onChange={(e) => setThickness(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                          </div>
                          <div>
                            <div className="flex justify-between items-end mb-3">
                              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">2. Délka zdi</h3>
                              <span className="text-2xl font-black text-white italic leading-none">{length} <span className="text-xs font-bold text-white/40 not-italic uppercase tracking-widest ml-1">m</span></span>
                            </div>
                            <input type="range" min="1" max="100" step="1" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                          </div>
                        </div>

                        {/* Selections side-by-side */}
                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                          <div className="space-y-3">
                            <h3 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 italic">3. Typ zdiva</h3>
                            <div className="flex flex-col gap-2">
                              {calculatorData.map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => handleMaterialChange(m.id)}
                                  className={cn(
                                    "p-2.5 rounded-xl border-2 text-left transition-all",
                                    materialId === m.id ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/30"
                                  )}
                                >
                                  <div className={cn("font-black text-xs uppercase tracking-tight leading-none", materialId === m.id ? "text-primary" : "text-white")}>{m.label}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3 lg:border-l lg:border-white/5 lg:pl-6">
                            <h3 className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 italic">4. Technologie</h3>
                            <div className="flex flex-col gap-2">
                              {!materialId ? (
                                <div className="p-3 rounded-xl border-2 border-dashed border-white/5 text-white/20 text-[9px] font-bold uppercase tracking-widest leading-tight">
                                  Vyberte zdivo
                                </div>
                              ) : (
                                selectedMaterial?.availableServices.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setServiceId(s.id)}
                                    className={cn(
                                      "p-2.5 rounded-xl border-2 text-left transition-all text-xs font-black uppercase tracking-widest",
                                      serviceId === s.id ? "border-primary bg-primary text-neutral-dark" : "border-white/10 text-white/60 hover:border-white/30"
                                    )}
                                  >
                                    {s.label}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Result (40%) */}
                      <div className="lg:col-span-2 flex flex-col justify-center lg:border-l lg:border-white/5 lg:pl-10">
                        <div className="bg-primary/10 rounded-2xl p-8 border-2 border-primary/20 text-center relative overflow-hidden h-fit">
                          <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3 italic leading-none">
                            {!materialId ? "Rozpětí všech technologií" : !serviceId ? "Rozpětí pro dané zdivo" : "Odhad ceny pro vaši volbu"}
                          </div>
                          <div className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-3 leading-none">
                            {range.min.toLocaleString()} – {range.max.toLocaleString()} <span className="text-lg not-italic font-bold text-white/40 uppercase">Kč</span>
                          </div>
                          <div className="inline-block px-3 py-1 bg-white/5 rounded-full text-[9px] text-white/40 font-black uppercase tracking-widest leading-none">
                            Bez DPH | {selectedService?.label || (selectedMaterial ? "Všechny dostupné metody" : "Všechny varianty")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button onClick={() => setStep(2)} className="w-full btn-primary py-6 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/10 transition-transform active:scale-[0.98]">
                        Pokračovat k odeslání <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Contact Form */
                  <form onSubmit={handleSubmit} noValidate className="max-w-xl mx-auto space-y-6 py-2">
                    <div className="flex items-center gap-4 mb-6">
                      <button type="button" onClick={() => setStep(1)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-neutral-dark transition-all">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tight leading-none">Kontaktní údaje</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Jméno a příjmení *</label>
                        <input 
                          type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: undefined}); }}
                          className={cn("w-full bg-white/5 border-2 rounded-xl px-5 py-3.5 outline-none transition-colors text-white font-bold text-sm", errors.name ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                          placeholder="Jan Novák"
                        />
                        {errors.name && <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.name}</span>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Telefon *</label>
                        <input 
                          type="tel" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if(errors.phone) setErrors({...errors, phone: undefined}); }}
                          className={cn("w-full bg-white/5 border-2 rounded-xl px-5 py-3.5 outline-none transition-colors text-white font-bold text-sm", errors.phone ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                          placeholder="+420 777 888 999"
                        />
                        {errors.phone && <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">E-mail (volitelně)</label>
                      <input 
                        type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-primary transition-colors text-white font-bold text-sm"
                        placeholder="vas@email.cz"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Doplňující zpráva (volitelně)</label>
                      <textarea 
                        rows={2} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-3.5 outline-none focus:border-primary transition-colors text-white font-bold resize-none text-sm"
                        placeholder="Místo realizace, termín..."
                      />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-5 text-lg uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-primary/10">
                      {isSubmitting ? 'Odesílám...' : 'Odeslat nezávaznou poptávku'}
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-16 text-white">
                <div className="w-20 h-20 bg-primary text-neutral-dark rounded-full flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-4 leading-none">Poptávka <br /> úspěšně odeslána!</h3>
                <p className="text-lg text-white/60 font-medium max-w-sm mx-auto mb-10 leading-relaxed">Děkujeme. Brzy se vám ozveme s detailním rozpisem práce a přesnou cenou.</p>
                <button onClick={() => {setIsSubmitted(false); setStep(1); setMaterialId(null); setServiceId(null);}} className="btn-outline border-white/20 hover:bg-white/10 py-3.5 px-10 text-sm">Nová kalkulace</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

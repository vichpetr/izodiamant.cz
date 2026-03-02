'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronRight, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
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

interface FormErrors {
  name?: string;
  phone?: string;
}

export default function PricingCalculator() {
  const [step, setStep] = useState(1);
  const [materialId, setMaterialId] = useState<string>(calculatorData[0].id);
  const [serviceId, setServiceId] = useState<string>(calculatorData[0].availableServices[0].id);
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
    (calculatorData as Material[]).find(m => m.id === materialId)!, 
  [materialId]);

  const selectedService = useMemo(() => 
    selectedMaterial.availableServices.find(s => s.id === serviceId) || selectedMaterial.availableServices[0],
  [selectedMaterial, serviceId]);

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
    <section id="calculator" ref={sectionRef} className="py-24 bg-neutral-dark relative overflow-hidden scroll-mt-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <Calculator className="w-10 h-10 text-primary" />
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none">
              Kalkulačka <span className="text-primary">ceny sanace</span>
            </h2>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-white/10 p-8 md:p-12 shadow-2xl">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div key={step === 1 ? 'step1' : 'step2'} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                {step === 1 ? (
                  <div className="grid lg:grid-cols-2 gap-16">
                    {/* Column 1: Config */}
                    <div className="space-y-10">
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 italic">1. Typ zdiva</h3>
                          <select 
                            value={materialId} 
                            onChange={(e) => handleMaterialChange(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                          >
                            {calculatorData.map(m => <option key={m.id} value={m.id} className="bg-neutral-dark">{m.label}</option>)}
                          </select>
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 italic">2. Technologie</h3>
                          <select 
                            value={serviceId} 
                            onChange={(e) => setServiceId(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                          >
                            {selectedMaterial.availableServices.map(s => <option key={s.id} value={s.id} className="bg-neutral-dark">{s.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-4">
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">3. Tloušťka</h3>
                            <span className="text-xl font-black text-white italic">{thickness} cm</span>
                          </div>
                          <input type="range" min="15" max="150" step="5" value={thickness} onChange={(e) => setThickness(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-3">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">4. Délka</h3>
                            <span className="text-xl font-black text-white italic">{length} m</span>
                          </div>
                          <input type="range" min="1" max="100" step="1" value={length} onChange={(e) => setLength(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Result & CTA */}
                    <div className="flex flex-col justify-center">
                      <div className="bg-primary/10 rounded-2xl p-10 border-2 border-primary/20 text-center mb-8 relative overflow-hidden group">
                        <div className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 italic">Předběžné cenové rozpětí</div>
                        <div className="text-5xl font-black text-white italic tracking-tighter mb-4">
                          {range.min.toLocaleString()} – {range.max.toLocaleString()} <span className="text-xl not-italic font-bold text-white/40 uppercase">Kč</span>
                        </div>
                        <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Bez DPH | {selectedService.label}</div>
                      </div>
                      <button onClick={() => setStep(2)} className="w-full btn-primary py-6 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                        Pokračovat k odeslání <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Contact Form */
                  <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                      <button type="button" onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-neutral-dark transition-all">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Kontaktní údaje</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Jméno a příjmení *</label>
                        <input 
                          type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: undefined}); }}
                          className={cn("w-full bg-white/5 border-2 rounded-xl px-6 py-4 outline-none transition-colors text-white font-bold", errors.name ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                          placeholder="Jan Novák"
                        />
                        {errors.name && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.name}</span>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Telefon *</label>
                        <input 
                          type="tel" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if(errors.phone) setErrors({...errors, phone: undefined}); }}
                          className={cn("w-full bg-white/5 border-2 rounded-xl px-6 py-4 outline-none transition-colors text-white font-bold", errors.phone ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                          placeholder="+420 777 888 999"
                        />
                        {errors.phone && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.phone}</span>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">E-mail (volitelně)</label>
                      <input 
                        type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                        placeholder="vas@email.cz"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Doplňující zpráva (volitelně)</label>
                      <textarea 
                        rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold resize-none"
                        placeholder="Místo realizace, termín..."
                      />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-6 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50">
                      {isSubmitting ? 'Odesílám...' : 'Odeslat nezávaznou poptávku'}
                      <Send className="w-6 h-6" />
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20">
                <div className="w-24 h-24 bg-primary text-neutral-dark rounded-full flex items-center justify-center mb-10 shadow-xl shadow-primary/20">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6">Poptávka odeslána!</h3>
                <p className="text-xl text-white/60 font-medium max-w-md mx-auto mb-12">Děkujeme. Brzy se vám ozveme s detailním rozpisem.</p>
                <button onClick={() => {setIsSubmitted(false); setStep(1);}} className="btn-outline text-white border-white/20 hover:bg-white/10 py-4 px-10">Nová kalkulace</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

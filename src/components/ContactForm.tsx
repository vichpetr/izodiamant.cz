'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrors {
  name?: string;
  phone?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Jméno je povinné';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon je povinný';
    if (!formData.message.trim()) newErrors.message = 'Popis projektu je povinný';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          material: 'Obecný dotaz',
          thickness: 0,
          length: 0,
          price: 0,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Něco se nepovedlo.');
      }
    } catch {
      alert('Chyba při odesílání.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Info Side */}
          <div className="space-y-12 text-foreground">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-6 leading-tight">
                Nezávazná <br /><span className="text-primary">poptávka</span>
              </h2>
              <p className="text-lg text-neutral-dark/60 font-medium">
                Máte dotaz nebo chcete domluvit obhlídku? Napište nám.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110 text-neutral-dark">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">Zavolejte nám</div>
                  <div className="flex flex-col">
                    <a href="tel:+420737017012" className="text-xl font-black text-neutral-dark hover:text-primary transition-colors">+420 737 017 012</a>
                    <a href="tel:+420732902754" className="text-xl font-black text-neutral-dark hover:text-primary transition-colors">+420 732 902 754</a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110 text-neutral-dark">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">Napište nám</div>
                  <a href="mailto:info@izodiamant.cz" className="text-xl font-black text-neutral-dark hover:text-primary transition-colors">info@izodiamant.cz</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110 text-neutral-dark">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic">Sídlo firmy</div>
                  <address className="text-xl font-black text-neutral-dark not-italic uppercase tracking-tight leading-tight">
                    Mokrá Lhota 26<br />539 44 Nové Hrady
                  </address>
                </div>
              </div>
            </div>

            <div className="p-8 bg-neutral-light rounded-3xl border-2 border-neutral-dark/5">
              <h3 className="font-black uppercase tracking-tight mb-4 italic text-neutral-dark">Konzultace zdarma</h3>
              <p className="text-neutral-dark/60 text-sm font-medium leading-relaxed">
                Náš odborný technik vás navštíví, provede přesné měření vlhkosti a navrhne nejvhodnější technologický postup přímo na míru vaší stavbě. Vše zcela zdarma a nezávazně.
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-neutral-dark rounded-3xl p-8 md:p-12 shadow-2xl relative">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form key="contact-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="contact-name" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic cursor-pointer">Jméno a příjmení *</label>
                      <input
                        id="contact-name"
                        type="text" value={formData.name} 
                        onChange={(e) => { setFormData({ ...formData, name: e.target.value }); if(errors.name) setErrors({...errors, name: undefined}); }}
                        className={cn("w-full bg-white/5 border-2 rounded-xl px-6 py-4 outline-none transition-colors text-white font-bold", errors.name ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                      />
                      {errors.name && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.name}</span>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-phone" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic cursor-pointer">Telefon *</label>
                      <input
                        id="contact-phone"
                        type="tel" value={formData.phone} 
                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); if(errors.phone) setErrors({...errors, phone: undefined}); }}
                        className={cn("w-full bg-white/5 border-2 rounded-xl px-6 py-4 outline-none transition-colors text-white font-bold", errors.phone ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                      />
                      {errors.phone && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic cursor-pointer">E-mail (volitelně)</label>
                    <input
                      id="contact-email"
                      type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="contact-message" className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic cursor-pointer">Zpráva / Popis projektu *</label>
                    <textarea
                      id="contact-message"
                      rows={4} value={formData.message} 
                      onChange={(e) => { setFormData({ ...formData, message: e.target.value }); if(errors.message) setErrors({...errors, message: undefined}); }}
                      className={cn("w-full bg-white/5 border-2 rounded-xl px-6 py-4 outline-none transition-colors text-white font-bold resize-none", errors.message ? "border-red-500/50" : "border-white/10 focus:border-primary")}
                    ></textarea>
                    {errors.message && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest ml-2">{errors.message}</span>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-6 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50">
                    {isSubmitting ? 'Odesílám...' : 'Odeslat zprávu'}
                    <Send className="w-6 h-6" />
                  </button>
                </motion.form>
              ) : (
                <motion.div key="success-contact" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-20 text-white">
                  <div className="w-24 h-24 bg-primary text-neutral-dark rounded-full flex items-center justify-center mb-10 shadow-xl shadow-primary/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-6 leading-none">Zpráva <br /> odeslána!</h3>
                  <p className="text-xl text-white/60 font-medium max-w-md mx-auto leading-relaxed">Děkujeme. Budeme vás kontaktovat co nejdříve.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

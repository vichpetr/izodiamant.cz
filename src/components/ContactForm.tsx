'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, Phone, Mail } from 'lucide-react';

export default function ContactForm({ lang }: { lang: string }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const content = {
    cs: {
      h2: "Nezávazná poptávka",
      sub: "Máte dotaz nebo chcete domluvit obhlídku? Napište nám.",
      name: "Jméno a příjmení",
      email: "E-mail",
      phone: "Telefon",
      message: "Zpráva / Popis projektu",
      send: "Odeslat zprávu",
      success_h3: "Zpráva odeslána!",
      success_p: "Děkujeme. Budeme vás kontaktovat co nejdříve.",
    },
    en: {
      h2: "Non-binding Inquiry",
      sub: "Do you have a question or want to arrange a site visit? Write to us.",
      name: "Full Name",
      email: "E-mail",
      phone: "Phone",
      message: "Message / Project Description",
      send: "Send Message",
      success_h3: "Message sent!",
      success_p: "Thank you. We will contact you as soon as possible.",
    },
  }[lang as "cs" | "en"] || {
    h2: "Nezávazná poptávka",
    sub: "Máte dotaz nebo chcete domluvit obhlídku? Napište nám.",
    name: "Jméno a příjmení",
    email: "E-mail",
    phone: "Telefon",
    message: "Zpráva / Popis projektu",
    send: "Odeslat zprávu",
    success_h3: "Zpráva odeslána!",
    success_p: "Děkujeme. Budeme vás kontaktovat co nejdříve.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="space-y-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-neutral-dark uppercase tracking-tighter italic mb-6">
                {content.h2}
              </h2>
              <p className="text-lg text-neutral-dark/60 font-medium">
                {content.sub}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110">
                  <Phone className="w-6 h-6 text-neutral-dark" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Zavolejte nám</div>
                  <a href="tel:+420123456789" className="text-xl font-black text-neutral-dark hover:text-primary transition-colors">+420 123 456 789</a>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20 transform transition-transform group-hover:scale-110">
                  <Mail className="w-6 h-6 text-neutral-dark" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Napište nám</div>
                  <a href="mailto:info@izodiamant.cz" className="text-xl font-black text-neutral-dark hover:text-primary transition-colors">info@izodiamant.cz</a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-dark rounded-3xl p-8 md:p-12 shadow-2xl relative">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">{content.name}</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">{content.phone}</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">{content.email}</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">{content.message}</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-6 py-4 outline-none focus:border-primary transition-colors text-white font-bold resize-none"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary py-5 text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Odesílám...' : content.send}
                    <Send className="w-6 h-6" />
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-contact"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-20"
                >
                  <div className="w-24 h-24 bg-primary text-neutral-dark rounded-full flex items-center justify-center mb-10 shadow-xl shadow-primary/20">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-6">{content.success_h3}</h3>
                  <p className="text-xl text-white/60 font-medium max-w-md mx-auto">
                    {content.success_p}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

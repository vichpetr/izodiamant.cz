"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = typeof window !== 'undefined' ? localStorage.getItem("cookie-consent") : null;
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateConsent = (isAccepted: boolean) => {
    localStorage.setItem("cookie-consent", isAccepted ? "true" : "false");
    
    // Odeslání informace do Google Analytics (Consent Mode)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': isAccepted ? 'granted' : 'denied',
        'ad_storage': isAccepted ? 'granted' : 'denied'
      });
    }
    
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
      <div className="bg-neutral-dark/95 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-white font-black uppercase tracking-widest text-xs italic">Soukromí a cookies</h4>
          <p className="text-sm text-white/60 font-medium leading-relaxed max-w-xl">
            Tento web používá soubory cookies pro analýzu návštěvnosti. Pomozte nám vylepšovat naše služby udělením souhlasu.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => updateConsent(false)}
            className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white px-6 py-3 transition-colors"
          >
            Odmítnout
          </button>
          <button
            onClick={() => updateConsent(true)}
            className="btn-primary text-xs uppercase tracking-[0.2em] py-4 px-10 shadow-xl shadow-primary/20"
          >
            Povolit vše
          </button>
        </div>
      </div>
    </div>
  );
}

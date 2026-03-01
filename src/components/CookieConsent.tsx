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

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-white border-t border-neutral-light shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-neutral-dark/70 font-medium">
          Tento web používá soubory cookies pro analýzu návštěvnosti a vylepšování uživatelského zážitku. Pokračováním v prohlížení souhlasíte s jejich použitím.
        </p>
        <div className="flex gap-4 shrink-0">
          <button
            onClick={() => setShow(false)}
            className="text-sm font-bold uppercase tracking-widest text-neutral-dark/50 hover:text-neutral-dark px-4 py-2 transition-colors"
          >
            Nezbytné
          </button>
          <button
            onClick={accept}
            className="btn-primary text-xs uppercase tracking-[0.2em] py-3 px-8"
          >
            Povolit vše
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

// Cloudflare Turnstile (CAPTCHA) widget pro ochranu formulářů.
//
// Graceful degradation: bez veřejného klíče (NEXT_PUBLIC_TURNSTILE_SITE_KEY)
// se widget vůbec nevykreslí a formuláře fungují jako dřív. Ochrana se zapne až
// po doplnění klíčů do konfigurace (a nastavení TURNSTILE_SECRET_KEY na serveru,
// který token ověřuje v /api/send).

import { useEffect, useRef } from 'react';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/** Je Turnstile zapnutý? (Formuláře podle toho vyžadují token před odesláním.) */
export const TURNSTILE_ENABLED = !!SITE_KEY;

interface TurnstileApi {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.turnstile) return resolve();
    const ready = () => {
      const iv = setInterval(() => {
        if (window.turnstile) {
          clearInterval(iv);
          resolve();
        }
      }, 100);
    };
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) return ready();
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = ready;
    document.head.appendChild(s);
  });
}

/**
 * `onVerify` dostane token po vyřešení (a prázdný řetězec při vypršení/chybě,
 * ať formulář token zneplatní). Callback držíme v refu, aby se widget
 * nererenderoval při každém renderu rodiče.
 */
export default function Turnstile({ onVerify }: { onVerify: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    let cancelled = false;

    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (token: string) => onVerifyRef.current(token),
        'expired-callback': () => onVerifyRef.current(''),
        'error-callback': () => onVerifyRef.current(''),
      });
    });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {
          /* widget už mohl být odstraněn */
        }
      }
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} />;
}

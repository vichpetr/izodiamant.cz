'use client';

import { useEffect } from 'react';

export default function WebMCP() {
  useEffect(() => {
    // Check if the browser or agent supports WebMCP
    if (typeof window !== 'undefined' && 'modelContext' in navigator) {
      const nav = navigator as any;
      if (nav.modelContext && nav.modelContext.provideContext) {
        try {
          nav.modelContext.provideContext({
            tools: [
              {
                name: 'get_services',
                description: 'Získat informace o službách sanace a podřezávání zdiva IZODIAMANT',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
                execute: async () => {
                  return {
                    content: [
                      {
                        type: 'text',
                        text: 'IZODIAMANT nabízí: podřezávání diamantovým lanem, podřezávání řetězovou pilou a chemickou injektáž. Působíme po celé ČR.',
                      },
                    ],
                  };
                },
              },
              {
                name: 'get_contact_info',
                description: 'Získat kontaktní údaje na IZODIAMANT',
                inputSchema: {
                  type: 'object',
                  properties: {},
                },
                execute: async () => {
                  return {
                    content: [
                      {
                        type: 'text',
                        text: 'Telefon: +420 737 017 012, Adresa: Mokrá Lhota 26, Nové Hrady 539 44.',
                      },
                    ],
                  };
                },
              },
            ],
          });
        } catch (e) {
          console.warn('Failed to provide WebMCP context', e);
        }
      }
    }
  }, []);

  return null;
}

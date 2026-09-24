'use client';

// Krok 3: verze PDF nabídky. Každé vygenerování se změněnými údaji založí novou
// verzi (stará zůstává). K e-mailu se přikládá poslední verze, pokud uživatel
// nevybere jinou – třeba když klient reagoval na starší variantu.

import { versionFilename, type Quote, type QuoteVersion } from '@/lib/quotes/model';
import { Icons } from '@/components/Icons';
import { cardCls, fileUrl, fmtDateTime, headingCls } from './ui';
import { useToastAction, type Action } from './useToastAction';

export default function VersionsPanel({
  quote,
  versions,
  stale,
  setVersionAction,
}: {
  quote: Quote;
  versions: QuoteVersion[];
  /** Údaje se od poslední verze změnily – PDF je třeba vygenerovat znovu. */
  stale: boolean;
  setVersionAction: Action;
}) {
  const [formAction, saving] = useToastAction(setVersionAction);
  const selected = versions.find((v) => v.version === quote.email_version)?.version ?? null;
  const number = quote.number ?? '';

  return (
    <section className={cardCls}>
      <h2 className={`${headingCls} mb-1`}>Verze nabídky</h2>
      <p className="text-sm text-neutral-dark/50 mb-4">
        Nová verze vznikne jen když se od minula změnily údaje nebo ceny. K e-mailu se přikládá vybraná verze.
      </p>
      {stale && (
        <p className="text-sm text-amber-800 bg-amber-50 rounded-xl px-3 py-2 mb-4">
          Údaje se od poslední verze změnily – v kroku 2 klikněte na „Uložit a vygenerovat PDF“, vznikne nová verze.
        </p>
      )}
      {versions.length === 0 ? (
        <p className="text-sm text-neutral-dark/50">PDF zatím není – vyplňte nabídku v kroku 2 a vygenerujte ho.</p>
      ) : (
        <form action={formAction}>
          <input type="hidden" name="id" value={quote.id} />
          <ul className="divide-y divide-neutral-light text-sm">
            <li className="py-2">
              <label className="flex items-center gap-3">
                <input
                  type="radio"
                  name="version"
                  value=""
                  defaultChecked={selected === null}
                  disabled={saving}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="accent-primary"
                />
                <span>
                  Vždy poslední verze <span className="text-neutral-dark/40">(doporučeno)</span>
                </span>
              </label>
            </li>
            {versions.map((v, i) => (
              <li key={v.id} className="py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <label className="flex items-center gap-3 min-w-[12rem]">
                  <input
                    type="radio"
                    name="version"
                    value={v.version}
                    defaultChecked={selected === v.version}
                    disabled={saving}
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                    className="accent-primary"
                  />
                  <span>
                    <strong>Verze {v.version}</strong>
                    {i === 0 && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary-ink">poslední</span>}
                  </span>
                </label>
                <span className="text-neutral-dark/50 text-xs">{fmtDateTime(v.created_at)}</span>
                {v.total_label && <span className="font-bold">{v.total_label}</span>}
                {v.sent_at && <span className="text-[10px] font-black uppercase tracking-widest text-sky-800">odesláno {fmtDateTime(v.sent_at)}</span>}
                <span className="ml-auto flex items-center gap-3">
                  <a href={fileUrl(v.pdf_key)} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-primary-ink hover:underline">
                    <Icons.FileText className="w-3.5 h-3.5" /> {versionFilename(number, v.version)}
                  </a>
                  {v.vykaz_key && (
                    <a href={fileUrl(v.vykaz_key)} className="text-[11px] font-black uppercase tracking-widest text-emerald-800 hover:underline" title="Vyplněný výkaz výměr – návrh ke kontrole">
                      Výkaz XLSX
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </form>
      )}
    </section>
  );
}

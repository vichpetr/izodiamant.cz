'use client';

import { useState } from 'react';
import { Icons } from '@/components/Icons';

/** Textové pole s tlačítkem „Kopírovat" – pro snadné přenesení FB postu. */
export default function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* schránka nedostupná – uživatel může označit ručně */
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40">Facebook post</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-primary/15 text-primary-ink hover:bg-primary/25 transition-colors"
        >
          {copied ? <><Icons.CheckCircle2 className="w-3.5 h-3.5" /> Zkopírováno</> : <><Icons.FileText className="w-3.5 h-3.5" /> Kopírovat</>}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm text-neutral-dark/80 bg-neutral-light rounded-2xl p-4 border border-neutral-dark/5 leading-relaxed">{text}</pre>
    </div>
  );
}

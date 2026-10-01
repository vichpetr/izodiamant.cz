import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { isDbAvailable } from '@/lib/db';
import { listPromptOverrides } from '@/lib/promptsDb';
import { PROMPTS } from '@/lib/quotes/prompts';
import { getWorkerStatus } from '@/lib/quotesWorker';
import SpravaNav from '../SpravaNav';
import { cardCls, headingCls } from '../nabidky/ui';
import PromptEditor from './PromptEditor';

export const metadata: Metadata = {
  title: 'AI prompty',
  robots: { index: false, follow: false },
};

export default async function PromptsPage() {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  const [overrides, status] = await Promise.all([listPromptOverrides(), getWorkerStatus()]);
  const areas = [...new Set(PROMPTS.map((p) => p.area))];

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava/prompty" email={session.user.email} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-lg font-black uppercase italic text-neutral-dark">AI prompty</h1>
          <p className="text-sm text-neutral-dark/60 font-medium max-w-2xl">
            Pokyny, podle kterých AI třídí poštu, čte podklady a píše e-maily. Úprava platí od dalšího volání AI (bez nasazení).
            Výstup AI je vždy jen návrh – ceny počítá kód, ne model. Když se výsledek zhorší, tlačítkem „Vrátit výchozí text“ se vrátíte k původnímu znění.
          </p>
          {!isDbAvailable() && (
            <p className="text-sm font-bold text-amber-800 bg-amber-50 rounded-xl px-4 py-3">Databáze není dostupná – úpravy nelze uložit.</p>
          )}
        </header>

        {areas.map((area) => (
          <section key={area} className="space-y-4">
            <h2 className={headingCls}>{area}</h2>
            {PROMPTS.filter((p) => p.area === area).map((def) => (
              <article key={def.key} className={cardCls}>
                <h3 className="font-black text-neutral-dark">{def.title}</h3>
                <p className="text-sm text-neutral-dark/60 font-medium mt-1 mb-4">{def.description}</p>
                <PromptEditor def={def} override={overrides[def.key] ?? null} model={status?.models?.[def.task] ?? null} />
              </article>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { isDbAvailable } from '@/lib/db';
import { getQuoteBundle, listCustomerOptions, listInbox, listQuotes } from '@/lib/quotesDb';
import { getWorkerStatus } from '@/lib/quotesWorker';
import { computeTotals, fingerprintHash, formatArea, formatCzk, formatNumber } from '@/lib/quotes/calc';
import {
  RELEVANT,
  effectiveRelevance,
  attachedVykazFiles,
  fillableVykazIds,
  materialLabel,
  parseJsonArray,
  technologyLabel,
  versionFilename,
  vykazFilename,
  type Quote,
  type QuoteItem,
} from '@/lib/quotes/model';
import SpravaNav from '../SpravaNav';
import {
  createQuoteAction,
  deleteQuoteAction,
  draftEmailAction,
  pollInboxAction,
  reanalyzeFileAction,
  regenerateEmailAction,
  retryInboxAction,
  saveEmailAction,
  saveQuoteAction,
  sendEmailAction,
  setEmailVersionAction,
  setIncludeAction,
  setRelevanceAction,
  setStatusAction,
  uploadPlansAction,
} from './actions';
import AttachmentsPanel from './AttachmentsPanel';
import EmailPanel from './EmailPanel';
import InboxPanel from './InboxPanel';
import NewQuoteModal from './NewQuoteModal';
import OutputPanel from './OutputPanel';
import QuoteActions from './QuoteActions';
import QuoteEditor from './QuoteEditor';
import QuoteWizard, { NextStepButton, type Step } from './QuoteWizard';
import QuotesTable from './QuotesTable';
import VersionsPanel from './VersionsPanel';
import { StatusBadge, cardCls, fmtDateTime, headingCls } from './ui';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Cenové nabídky',
  robots: { index: false, follow: false },
};

// Seznam i detail jsou jedna route (detail = ?id=…&krok=1|2|3). Každá /sprava/*
// route je samostatná edge funkce a zvětšuje worker Pages – viz deployment.MD.
export default async function NabidkyPage({ searchParams }: { searchParams: Promise<{ id?: string; krok?: string }> }) {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  const { id, krok } = await searchParams;
  const status = await getWorkerStatus();

  return (
    <main className="min-h-screen bg-neutral-light">
      <SpravaNav active="/sprava/nabidky" email={session.user.email} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {!isDbAvailable() && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <strong>Databáze není připojená.</strong> Chybí binding <code>DB</code> (Cloudflare D1).
          </div>
        )}
        {id ? <QuoteDetail id={Number(id)} step={Number(krok)} status={status} /> : <QuoteList status={status} />}
      </div>
    </main>
  );
}

async function QuoteList({ status }: { status: Awaited<ReturnType<typeof getWorkerStatus>> }) {
  const [quotes, customers, inbox] = await Promise.all([listQuotes(), listCustomerOptions(), listInbox()]);
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black uppercase italic text-neutral-dark tracking-tight">Cenové nabídky</h1>
        <NewQuoteModal customers={customers} action={createQuoteAction} />
      </div>
      <InboxPanel status={status} inbox={inbox} pollAction={pollInboxAction} retryAction={retryInboxAction} />
      <QuotesTable quotes={quotes} />
    </>
  );
}

async function QuoteDetail({ id, step, status }: { id: number; step: number; status: Awaited<ReturnType<typeof getWorkerStatus>> }) {
  const bundle = Number.isInteger(id) ? await getQuoteBundle(id) : null;
  if (!bundle) {
    return (
      <div className={cardCls}>
        Nabídka nenalezena. <Link href="/sprava/nabidky" className="font-bold text-primary-ink">Zpět na seznam</Link>
      </div>
    );
  }
  const { quote, items, files, messages, versions, source } = bundle;
  const missing = parseJsonArray(quote.missing);
  const latest = versions[0] ?? null;
  // Změnily se údaje od poslední verze? (Verze 1 převzatá z doby před verzováním nemá otisk.)
  const stale = latest
    ? latest.input_hash
      ? latest.input_hash !== (await fingerprintHash(quote, items, fillableVykazIds(files)))
      : quote.status === 'koncept'
    : false;
  const emailVersion = versions.find((v) => v.version === quote.email_version) ?? latest;
  const attachments = emailVersion
    ? [
        versionFilename(quote.number ?? '', emailVersion.version),
        ...attachedVykazFiles(emailVersion, files).map((f) => vykazFilename(quote.number ?? '', emailVersion.version, f.technology)),
      ]
    : quote.pdf_key && quote.number
      ? [`${quote.number}.pdf`]
      : [];

  // Výchozí krok: hotové PDF → odeslání; poptávka z e-mailu nebo přílohy → podklady; jinak formulář.
  const initialStep: Step =
    step === 1 || step === 2 || step === 3 ? step : versions.length || quote.pdf_key ? 3 : source || files.length ? 1 : 2;
  const relevantCount = files.filter((f) => {
    const r = effectiveRelevance(f);
    return r === null || RELEVANT.includes(r);
  }).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/sprava/nabidky" className="text-[11px] font-black uppercase tracking-widest text-neutral-dark/40 hover:text-neutral-dark">← Všechny nabídky</Link>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl font-black uppercase italic text-neutral-dark tracking-tight">{quote.number ?? `Nabídka #${quote.id}`}</h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="text-xs text-neutral-dark/40 mt-1">
            {quote.client_name} · založeno {fmtDateTime(quote.created_at)} {quote.created_by === 'system' ? 'automaticky z e-mailu' : quote.created_by ? `· ${quote.created_by}` : ''}
          </p>
        </div>
        <QuoteActions id={quote.id} status={quote.status} setStatusAction={setStatusAction} deleteAction={deleteQuoteAction} />
      </div>

      {quote.status === 'ceka_na_udaje' && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          <strong>Čeká na doplnění:</strong> {missing.join(', ')}.
        </div>
      )}
      {quote.status === 'pripraveno' && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 text-sm text-violet-900">
          <strong>Připraveno k odeslání.</strong> Nabídku i PDF připravila AI z e-mailu – zkontrolujte údaje a ceny, pak ji v kroku 3 odešlete.
        </div>
      )}
      {!status && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          Služba nabídek (quotes-worker) není připojená – formulář lze ukládat, ale PDF, čtení příloh a e-maily nepůjdou.
        </div>
      )}

      <QuoteWizard
        initialStep={initialStep}
        hints={{
          1: `${source ? 'e-mail · ' : ''}${plural(files.length, 'příloha', 'přílohy', 'příloh')}`,
          2: items.length ? `${plural(items.length, 'položka', 'položky', 'položek')}${missing.length ? ` · chybí ${missing.length}` : ''}` : 'bez položek',
          3: latest ? `verze ${latest.version}${stale ? ' · zastaralá' : ''}` : 'PDF zatím není',
        }}
        step1={
          <>
            {source && <EmailPanel source={source} />}
            <AttachmentsPanel
              quoteId={quote.id}
              files={files}
              uploadAction={uploadPlansAction}
              reanalyzeAction={reanalyzeFileAction}
              relevanceAction={setRelevanceAction}
              includeAction={setIncludeAction}
            />
            <NextStepButton to={2}>Pokračovat na údaje a ceny →</NextStepButton>
            {relevantCount === 0 && files.length > 0 && (
              <p className="text-right text-xs text-neutral-dark/40">Žádná příloha nevypadá užitečně – rozměry doplňte ručně v kroku 2.</p>
            )}
          </>
        }
        step2={<QuoteEditor key={quote.id} quote={quote} items={items} files={files} saveAction={saveQuoteAction} />}
        step3={
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <VersionsPanel quote={quote} versions={versions} stale={stale} setVersionAction={setEmailVersionAction} />
              <OutputPanel
                key={quote.updated_at}
                quote={quote}
                attachments={attachments}
                versionCount={versions.length}
                mailbox={status?.mailbox ?? null}
                mailboxReady={Boolean(status?.mailboxConfigured)}
                sendEnabled={Boolean(status?.sendEnabled)}
                saveEmailAction={saveEmailAction}
                regenerateEmailAction={regenerateEmailAction}
                draftEmailAction={draftEmailAction}
                sendEmailAction={sendEmailAction}
              />
            </div>
            <div className="space-y-6">
              <QuoteSummary quote={quote} items={items} />
              <section className={cardCls}>
                <h2 className={`${headingCls} mb-3`}>Historie e-mailů</h2>
                {messages.length === 0 ? (
                  <p className="text-sm text-neutral-dark/50">Zatím nic.</p>
                ) : (
                  <ul className="space-y-3 text-sm">
                    {messages.map((m) => (
                      <li key={m.id}>
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-dark/40">
                          {fmtDateTime(m.created_at)} · {m.kind === 'draft' ? 'koncept do schránky' : m.kind === 'sent' ? 'odesláno' : 'odpověď klienta'}
                        </div>
                        <div className={m.status === 'error' ? 'text-red-700' : ''}>
                          {m.subject}
                          {m.status === 'error' && ` – ${m.error}`}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        }
      />
    </>
  );
}

/** „1 příloha“, „3 přílohy“, „5 příloh“. */
function plural(n: number, one: string, few: string, many: string): string {
  return `${n} ${n === 1 ? one : n >= 2 && n <= 4 ? few : many}`;
}

/** Krok 3: rekapitulace uložené nabídky – co přesně klient dostane. */
function QuoteSummary({ quote, items }: { quote: Quote; items: QuoteItem[] }) {
  const totals = computeTotals(quote, items);
  const place = [quote.site_name, quote.site_address, quote.city].filter(Boolean).join(', ');
  return (
    <section className={`${cardCls} text-sm`}>
      <h2 className={`${headingCls} mb-3`}>Souhrn nabídky</h2>
      <p className="font-bold">{quote.client_name}</p>
      <p className="text-neutral-dark/60">{[quote.client_email, quote.client_phone].filter(Boolean).join(' · ') || 'bez kontaktu'}</p>
      {place && <p className="text-neutral-dark/60 mt-1">{place}</p>}
      {(quote.material || quote.thickness_cm || quote.length_m) && (
        <p className="text-neutral-dark/60 mt-1">
          {[materialLabel(quote.material), quote.thickness_cm ? `${quote.thickness_cm} cm` : null, quote.length_m ? `${quote.length_m} m` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      <dl className="mt-3 space-y-1">
        {totals.lines.map((l, i) => (
          <div key={i} className="flex justify-between gap-2">
            <dt className="text-neutral-dark/60">
              {technologyLabel(l.technology)} (
              {l.length_m && l.thickness_cm ? `${formatNumber(l.length_m)} m × ${formatNumber(l.thickness_cm)} cm = ` : ''}
              {formatArea(l.area_m2)} × {formatCzk(l.price_per_m2)})
            </dt>
            <dd className="whitespace-nowrap">{formatCzk(quote.mode === 'varianty' ? totals.variantTotals[i] : l.workPrice)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-2">
          <dt className="text-neutral-dark/60">Doprava{quote.mode === 'varianty' ? ' (v každé variantě)' : ''}</dt>
          <dd className="whitespace-nowrap">{formatCzk(quote.transport_price)}</dd>
        </div>
        {quote.mode === 'kombinace' && (
          <div className="flex justify-between gap-2 pt-2 mt-1 border-t border-neutral-light font-black">
            <dt>Celkem</dt>
            <dd className="whitespace-nowrap">{formatCzk(totals.total)}</dd>
          </div>
        )}
      </dl>
      <p className="text-[11px] text-neutral-dark/40 mt-2">Ze stavu po posledním uložení. Úpravy v kroku 2.</p>
    </section>
  );
}

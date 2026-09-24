import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { safeAuth, isAllowed } from '@/auth';
import { isDbAvailable } from '@/lib/db';
import { getQuoteBundle, listCustomerOptions, listInbox, listQuotes } from '@/lib/quotesDb';
import { getWorkerStatus } from '@/lib/quotesWorker';
import { parseJsonArray } from '@/lib/quotes/model';
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
  setStatusAction,
  uploadPlansAction,
} from './actions';
import InboxPanel from './InboxPanel';
import NewQuoteModal from './NewQuoteModal';
import OutputPanel from './OutputPanel';
import QuoteActions from './QuoteActions';
import QuoteEditor from './QuoteEditor';
import QuotesTable from './QuotesTable';
import SourceEmail from './SourceEmail';
import { StatusBadge, cardCls, fmtDateTime, headingCls } from './ui';

export const runtime = 'edge';
export const metadata: Metadata = {
  title: 'Cenové nabídky',
  robots: { index: false, follow: false },
};

// Seznam i detail jsou jedna route (detail = ?id=…). Každá /sprava/* route je
// samostatná edge funkce a zvětšuje worker Pages – viz deployment.MD.
export default async function NabidkyPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const session = await safeAuth();
  if (!session?.user || !isAllowed(session.user.email)) redirect('/sprava/prihlaseni');

  const { id } = await searchParams;
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
        {id ? <QuoteDetail id={Number(id)} status={status} /> : <QuoteList status={status} />}
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

async function QuoteDetail({ id, status }: { id: number; status: Awaited<ReturnType<typeof getWorkerStatus>> }) {
  const bundle = Number.isInteger(id) ? await getQuoteBundle(id) : null;
  if (!bundle) {
    return (
      <div className={cardCls}>
        Nabídka nenalezena. <Link href="/sprava/nabidky" className="font-bold text-primary-ink">Zpět na seznam</Link>
      </div>
    );
  }
  const { quote, items, files, messages, source } = bundle;
  const missing = parseJsonArray(quote.missing);

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
            Založeno {fmtDateTime(quote.created_at)} {quote.created_by === 'system' ? 'automaticky z e-mailu' : quote.created_by ? `· ${quote.created_by}` : ''}
          </p>
        </div>
        <QuoteActions id={quote.id} status={quote.status} setStatusAction={setStatusAction} deleteAction={deleteQuoteAction} />
      </div>

      {quote.status === 'ceka_na_udaje' && missing.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          <strong>Čeká na doplnění:</strong> {missing.join(', ')}.
        </div>
      )}
      {source && <SourceEmail source={source} summary={quote.note} />}

      {!status && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          Služba nabídek (quotes-worker) není připojená – formulář lze ukládat, ale PDF, čtení plánků a e-maily nepůjdou.
        </div>
      )}

      <QuoteEditor
        key={quote.id}
        quote={quote}
        items={items}
        files={files}
        saveAction={saveQuoteAction}
        uploadAction={uploadPlansAction}
        reanalyzeAction={reanalyzeFileAction}
      />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <OutputPanel
            key={quote.updated_at}
            quote={quote}
            mailbox={status?.mailbox ?? null}
            mailboxReady={Boolean(status?.mailboxConfigured)}
            sendEnabled={Boolean(status?.sendEnabled)}
            saveEmailAction={saveEmailAction}
            regenerateEmailAction={regenerateEmailAction}
            draftEmailAction={draftEmailAction}
            sendEmailAction={sendEmailAction}
          />
        </div>
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
    </>
  );
}

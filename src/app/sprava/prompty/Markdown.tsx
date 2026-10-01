// Malý renderer markdownu pro náhled promptů (nadpisy, odstavce, odrážky, číslované seznamy,
// citace, bloky kódu, **tučné**, *kurzíva*, `kód`). Vyrábí React prvky, nikdy ne HTML řetězec,
// takže vložený text nemůže spustit skript. Samostatná knihovna by zbytečně zvětšila worker.

import { Fragment, type ReactNode } from 'react';

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<code key={key} className="bg-neutral-light rounded px-1 py-0.5 font-mono text-[0.9em]">{m[1].slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{m[2].slice(2, -2)}</strong>);
    else out.push(<em key={key}>{m[3].slice(1, -1)}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Odstavec: jednotlivé konce řádků zůstávají (u promptů na nich záleží). */
function lines(text: string, keyBase: string): ReactNode[] {
  return text.split('\n').map((l, i) => (
    <Fragment key={`${keyBase}-${i}`}>
      {i > 0 && <br />}
      {inline(l, `${keyBase}-${i}`)}
    </Fragment>
  ));
}

const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

export default function Markdown({ source }: { source: string }) {
  const rows = source.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let k = 0;

  while (i < rows.length) {
    const row = rows[i];
    if (!row.trim()) {
      i++;
      continue;
    }
    const key = `b${k++}`;

    if (row.startsWith('```')) {
      const code: string[] = [];
      i++;
      while (i < rows.length && !rows[i].startsWith('```')) code.push(rows[i++]);
      i++;
      blocks.push(<pre key={key} className="bg-neutral-light rounded-xl p-3 font-mono text-[12px] whitespace-pre-wrap break-words">{code.join('\n')}</pre>);
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(row);
    if (heading) {
      const cls = ['text-lg font-black', 'text-base font-black', 'text-sm font-black uppercase tracking-wide'][heading[1].length - 1];
      blocks.push(<p key={key} className={cls}>{inline(heading[2], key)}</p>);
      i++;
      continue;
    }

    if (BULLET.test(row) || NUMBERED.test(row)) {
      const ordered = NUMBERED.test(row);
      const re = ordered ? NUMBERED : BULLET;
      const items: string[] = [];
      while (i < rows.length && re.test(rows[i])) items.push(re.exec(rows[i++])![1]);
      const li = items.map((t, n) => <li key={n}>{inline(t, `${key}-${n}`)}</li>);
      blocks.push(
        ordered ? (
          <ol key={key} className="list-decimal pl-6 space-y-1">{li}</ol>
        ) : (
          <ul key={key} className="list-disc pl-6 space-y-1">{li}</ul>
        ),
      );
      continue;
    }

    if (row.startsWith('>')) {
      const quote: string[] = [];
      while (i < rows.length && rows[i].startsWith('>')) quote.push(rows[i++].replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key} className="border-l-4 border-primary/40 pl-3 text-neutral-dark/70">{lines(quote.join('\n'), key)}</blockquote>);
      continue;
    }

    const para: string[] = [];
    while (i < rows.length && rows[i].trim() && !/^(#{1,3}\s|```|>)/.test(rows[i]) && !BULLET.test(rows[i]) && !NUMBERED.test(rows[i])) para.push(rows[i++]);
    blocks.push(<p key={key}>{lines(para.join('\n'), key)}</p>);
  }

  return <div className="space-y-3 text-sm leading-relaxed text-neutral-dark">{blocks}</div>;
}

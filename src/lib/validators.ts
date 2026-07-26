// Sdílené validátory pro admin formuláře (server actions).

/** Odstraní mezery, pomlčky, závorky, tečky a lomítka z telefonu. */
export function normalizePhone(v: string): string {
  return v.replace(/[\s\-()./]/g, '');
}

export function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/** 9 číslic, volitelně s mezinárodní předvolbou (+ a 1–3 číslice). */
export function isValidPhone(v: string): boolean {
  return /^(\+\d{1,3})?\d{9}$/.test(normalizePhone(v));
}

/** Platné datum ve formátu YYYY-MM-DD (odchytí i 2025-13-40). */
export function isValidDate(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  const [, y, mo, d] = m;
  const date = new Date(`${v}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === Number(y) &&
    date.getUTCMonth() + 1 === Number(mo) &&
    date.getUTCDate() === Number(d)
  );
}

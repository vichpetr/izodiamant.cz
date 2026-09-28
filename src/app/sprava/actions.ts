'use server';

// Server actions pro admin sekci /sprava. Každá NEJDŘÍV ověří přihlášení a to,
// že e-mail je v allowlistu (auth() + isAllowed) – to je skutečná bezpečnostní
// hranice, ne middleware. Teprve pak sáhne na D1 / e-mail.
//
// Akce vracejí { ok, message } (pro useActionState + toast v UI). Chyby se
// nevyhazují, ale vracejí jako { ok:false, message }.

import { revalidatePath } from 'next/cache';
import { safeAuth, isAllowed } from '@/auth';
import { addCustomer, deleteCustomer, getCustomer, logEmail, thankYouAlreadySent, updateRealizedAt } from '@/lib/db';
import { isMailerAvailable, sendWebMail } from '@/lib/mailer';
import { thankYouHtml, thankYouSubject } from '@/lib/thankYouEmail';
import { isValidEmail, isValidPhone, isValidDate } from '@/lib/validators';
import type { ActionState } from './ActionForm';

async function requireAdmin(): Promise<string> {
  const session = await safeAuth();
  const email = session?.user?.email;
  if (!email || !isAllowed(email)) throw new Error('Nemáte oprávnění.');
  return email;
}

function fail(err: unknown): ActionState {
  return { ok: false, message: err instanceof Error ? err.message : 'Došlo k chybě.' };
}

export async function addCustomerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const admin = await requireAdmin();
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const realized = String(formData.get('realized_at') || '').trim();

    // Povinná pole
    if (!name) return { ok: false, message: 'Jméno a příjmení je povinné.' };
    if (!email) return { ok: false, message: 'E-mail je povinný.' };
    if (!phone) return { ok: false, message: 'Telefon je povinný.' };
    // Formáty
    if (!isValidEmail(email)) return { ok: false, message: 'E-mail nemá platný formát.' };
    if (!isValidPhone(phone)) return { ok: false, message: 'Telefon musí mít 9 číslic, volitelně s předvolbou (např. +420).' };
    if (realized && !isValidDate(realized)) return { ok: false, message: 'Datum realizace nemá platný formát.' };

    await addCustomer({
      name,
      email,
      phone,
      project: String(formData.get('project') || '').trim() || null,
      jobSize: String(formData.get('job_size') || '').trim() || null,
      realized_at: realized || null,
      createdBy: admin,
    });
    revalidatePath('/sprava');
    return { ok: true, message: `Zákazník „${name}" uložen.` };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteCustomerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = Number(formData.get('id'));
    if (!Number.isFinite(id)) return { ok: false, message: 'Neplatné id.' };
    await deleteCustomer(id);
    revalidatePath('/sprava');
    return { ok: true, message: 'Záznam smazán.' };
  } catch (err) {
    return fail(err);
  }
}

/** Doplnění/změna data realizace u existujícího zákazníka (lze i dodatečně). */
export async function updateRealizedAtAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const id = Number(formData.get('id'));
    if (!Number.isFinite(id)) return { ok: false, message: 'Neplatné id.' };
    const realized = String(formData.get('realized_at') || '').trim();
    if (realized && !isValidDate(realized)) return { ok: false, message: 'Datum realizace nemá platný formát.' };
    await updateRealizedAt(id, realized || null);
    revalidatePath('/sprava');
    return { ok: true, message: 'Datum realizace uloženo.' };
  } catch (err) {
    return fail(err);
  }
}

/** Odešle poděkování + prosbu o hodnocení a zapíše výsledek do audit logu. */
export async function sendThankYouAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let admin: string;
  let customerEmail: string | null = null;
  const id = Number(formData.get('id'));
  try {
    admin = await requireAdmin();
    if (!Number.isFinite(id)) return { ok: false, message: 'Neplatné id.' };

    const customer = await getCustomer(id);
    if (!customer) return { ok: false, message: 'Zákazník nenalezen.' };
    if (!customer.email) return { ok: false, message: 'Zákazník nemá e-mail.' };
    customerEmail = customer.email;
    // Poděkování se posílá až po realizaci a jen jednou.
    if (!customer.realized_at) return { ok: false, message: 'Nejdřív vyplňte datum realizace.' };
    if (await thankYouAlreadySent(id)) return { ok: false, message: 'Poděkování už bylo odesláno.' };

    const subject = thankYouSubject();

    if (!isMailerAvailable()) {
      await logEmail({ customerId: id, toEmail: customer.email, subject, status: 'error', error: 'Chybí service binding QUOTES', sentBy: admin });
      return { ok: false, message: 'E-mailová služba není připojená (service binding QUOTES).' };
    }

    const { messageId } = await sendWebMail({ to: customer.email, subject, html: thankYouHtml(customer.name) });

    await logEmail({ customerId: id, toEmail: customer.email, subject, status: 'sent', messageId, sentBy: admin });
    revalidatePath('/sprava');
    revalidatePath('/sprava/log');
    return { ok: true, message: `Poděkování odesláno na ${customer.email}.` };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Zaloguj chybu odeslání (pokud známe admina i e-mail).
    try {
      const session = await safeAuth();
      if (session?.user?.email && customerEmail) {
        await logEmail({ customerId: id, toEmail: customerEmail, subject: thankYouSubject(), status: 'error', error: message, sentBy: session.user.email });
        revalidatePath('/sprava/log');
      }
    } catch { /* logování chyby je best-effort */ }
    return { ok: false, message: `Odeslání selhalo: ${message}` };
  }
}

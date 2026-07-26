'use server';

// Server actions pro admin sekci /sprava. Každá NEJDŘÍV ověří přihlášení a to,
// že e-mail je v allowlistu (auth() + isAllowed) – to je skutečná bezpečnostní
// hranice, ne middleware. Teprve pak sáhne na D1 / Resend.
//
// Akce vracejí { ok, message } (pro useActionState + toast v UI). Chyby se
// nevyhazují, ale vracejí jako { ok:false, message }.

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { safeAuth, isAllowed } from '@/auth';
import { addCustomer, deleteCustomer, getCustomer, logEmail, thankYouAlreadySent, updateRealizedAt } from '@/lib/db';
import { thankYouHtml, thankYouSubject } from '@/lib/thankYouEmail';
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
    if (!name) return { ok: false, message: 'Jméno je povinné.' };

    await addCustomer({
      name,
      email: String(formData.get('email') || '').trim() || null,
      phone: String(formData.get('phone') || '').trim() || null,
      project: String(formData.get('project') || '').trim() || null,
      jobSize: String(formData.get('job_size') || '').trim() || null,
      realized_at: String(formData.get('realized_at') || '').trim() || null,
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
    await updateRealizedAt(id, String(formData.get('realized_at') || '').trim() || null);
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

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'IZODIAMANT <onboarding@resend.dev>';
    const subject = thankYouSubject();

    if (!apiKey) {
      await logEmail({ customerId: id, toEmail: customer.email, subject, status: 'error', error: 'RESEND_API_KEY chybí', sentBy: admin });
      return { ok: false, message: 'E-mailová služba není nastavená (RESEND_API_KEY).' };
    }

    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [customer.email],
      subject,
      html: thankYouHtml(customer.name),
    });
    if (error) throw new Error(error.message || 'Resend error');

    await logEmail({ customerId: id, toEmail: customer.email, subject, status: 'sent', resendId: data?.id ?? null, sentBy: admin });
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

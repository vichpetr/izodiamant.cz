'use server';

// Server actions pro admin sekci /sprava. Každá NEJDŘÍV ověří přihlášení a to,
// že e-mail je v allowlistu (auth() + isAllowed) – to je skutečná bezpečnostní
// hranice, ne middleware. Teprve pak sáhne na D1 / Resend.

import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';
import { safeAuth, isAllowed } from '@/auth';
import { addCustomer, deleteCustomer, getCustomer, logEmail } from '@/lib/db';
import { thankYouHtml, thankYouSubject } from '@/lib/thankYouEmail';

async function requireAdmin(): Promise<string> {
  const session = await safeAuth();
  const email = session?.user?.email;
  if (!email || !isAllowed(email)) {
    throw new Error('Nemáte oprávnění.');
  }
  return email;
}

export async function addCustomerAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const name = String(formData.get('name') || '').trim();
  if (!name) throw new Error('Jméno je povinné.');

  await addCustomer({
    name,
    email: String(formData.get('email') || '').trim() || null,
    phone: String(formData.get('phone') || '').trim() || null,
    project: String(formData.get('project') || '').trim() || null,
    realized_at: String(formData.get('realized_at') || '').trim() || null,
    createdBy: admin,
  });
  revalidatePath('/sprava');
}

export async function deleteCustomerAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id)) throw new Error('Neplatné id.');
  await deleteCustomer(id);
  revalidatePath('/sprava');
}

/** Odešle poděkování + prosbu o hodnocení a zapíše výsledek do audit logu. */
export async function sendThankYouAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = Number(formData.get('id'));
  if (!Number.isFinite(id)) throw new Error('Neplatné id.');

  const customer = await getCustomer(id);
  if (!customer) throw new Error('Zákazník nenalezen.');
  if (!customer.email) throw new Error('Zákazník nemá e-mail.');

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'IZODIAMANT <onboarding@resend.dev>';
  const subject = thankYouSubject();

  if (!apiKey) {
    await logEmail({
      customerId: id, toEmail: customer.email, subject, status: 'error',
      error: 'RESEND_API_KEY chybí', sentBy: admin,
    });
    throw new Error('E-mailová služba není nastavená (RESEND_API_KEY).');
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [customer.email],
      subject,
      html: thankYouHtml(customer.name),
    });
    if (error) throw new Error(error.message || 'Resend error');

    await logEmail({
      customerId: id, toEmail: customer.email, subject, status: 'sent',
      resendId: data?.id ?? null, sentBy: admin,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logEmail({
      customerId: id, toEmail: customer.email, subject, status: 'error',
      error: message, sentBy: admin,
    });
    throw new Error(`Odeslání selhalo: ${message}`);
  }

  revalidatePath('/sprava');
  revalidatePath('/sprava/log');
}

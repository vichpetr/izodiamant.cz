'use server';

// Úprava AI promptů. Jako ostatní akce v /sprava: nejdřív ověřit admina.

import { revalidatePath } from 'next/cache';
import { safeAuth, isAllowed } from '@/auth';
import { resetPromptOverride, savePromptOverride } from '@/lib/promptsDb';
import { MAX_PROMPT_LENGTH, PROMPT_BY_KEY, isPromptKey } from '@/lib/quotes/prompts';
import type { ActionState } from '../ActionForm';

const PATH = '/sprava/prompty';

async function requireAdmin(): Promise<string> {
  const session = await safeAuth();
  const email = session?.user?.email;
  if (!email || !isAllowed(email)) throw new Error('Nemáte oprávnění.');
  return email;
}

function fail(err: unknown): ActionState {
  return { ok: false, message: err instanceof Error ? err.message : 'Došlo k chybě.' };
}

function keyOf(formData: FormData) {
  const key = String(formData.get('key') ?? '');
  if (!isPromptKey(key)) throw new Error('Neznámý prompt.');
  return key;
}

export async function savePromptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const by = await requireAdmin();
    const key = keyOf(formData);
    // Formuláře posílají CRLF; do promptu patří jen \n.
    const content = String(formData.get('content') ?? '').replace(/\r\n/g, '\n').trim();
    if (!content) throw new Error('Prompt nesmí být prázdný. Pro návrat k původnímu textu použijte „Výchozí“.');
    if (content.length > MAX_PROMPT_LENGTH) throw new Error(`Prompt je příliš dlouhý (max. ${MAX_PROMPT_LENGTH} znaků).`);
    if (content === PROMPT_BY_KEY[key].instructions) await resetPromptOverride(key);
    else await savePromptOverride(key, content, by);
    revalidatePath(PATH);
    return { ok: true, message: 'Prompt uložen – platí od dalšího volání AI.' };
  } catch (err) {
    return fail(err);
  }
}

export async function resetPromptAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    await resetPromptOverride(keyOf(formData));
    revalidatePath(PATH);
    return { ok: true, message: 'Obnoven výchozí prompt.' };
  } catch (err) {
    return fail(err);
  }
}

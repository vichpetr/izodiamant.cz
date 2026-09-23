'use client';

// useActionState + toast (jako ActionForm), ale s `pending` – u akcí, které
// čekají na AI / PDF (desítky sekund), musí uživatel vidět, že se něco děje.

import { startTransition, useActionState, useEffect } from 'react';
import type { ActionState } from '../ActionForm';
import { toast } from '../toast';

export type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function useToastAction(action: Action, onSuccess?: () => void) {
  const [state, formAction, pending] = useActionState(action, null);
  useEffect(() => {
    if (!state) return;
    toast(state.message, state.ok ? 'success' : 'error');
    if (state.ok) onSuccess?.();
    // onSuccess záměrně mimo závislosti – reagujeme jen na nový výsledek akce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return [formAction, pending] as const;
}

/**
 * onSubmit pro formuláře s řízenými (controlled) poli. `<form action={…}>` v
 * React 19 po dokončení akce formulář resetuje – u řízeného <select> to rozhodí
 * zobrazenou hodnotu proti stavu. Ruční odeslání přes startTransition reset nedělá.
 */
export function submitWithoutReset(formAction: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(e.currentTarget, submitter);
    startTransition(() => formAction(fd));
  };
}

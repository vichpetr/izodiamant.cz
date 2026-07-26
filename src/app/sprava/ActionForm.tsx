'use client';

// Obal nad server action: spustí ji, chytí návratový stav {ok,message} a
// zobrazí toast. Volitelně po úspěchu vyresetuje formulář. Používá se místo
// holého <form action=…> u všech akcí v admin sekci.

import { useActionState, useEffect, useRef } from 'react';
import { toast } from './toast';

export type ActionState = { ok: boolean; message: string } | null;

export default function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  onSuccess,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    toast(state.message, state.ok ? 'success' : 'error');
    if (state.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onSuccess?.();
    }
  }, [state, resetOnSuccess, onSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
    </form>
  );
}

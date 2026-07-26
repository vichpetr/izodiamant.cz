'use client';

// Lehký toast systém pro admin sekci. Modulový store (pub/sub) sdílený mezi
// ActionForm (které toast spouští) a <Toaster/> (které je vykresluje).

import { useSyncExternalStore } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'success' | 'error';
interface Toast {
  id: number;
  message: string;
  variant: Variant;
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function toast(message: string, variant: Variant = 'success') {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function Toaster() {
  const list = useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts,
  );
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-[90vw]">
      {list.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'px-5 py-3 rounded-xl shadow-2xl text-sm font-bold text-white animate-in fade-in slide-in-from-bottom-2',
            t.variant === 'success' ? 'bg-neutral-dark' : 'bg-red-600',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

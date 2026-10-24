import { useSyncExternalStore } from 'react';

/**
 * Open/closed state of the résumé preview. Any button on the page can open it;
 * <ResumeDialog /> (mounted once in App) renders it.
 */
const listeners = new Set<() => void>();
let open = false;

function set(next: boolean) {
  if (next === open) return;
  open = next;
  listeners.forEach((l) => l());
}

export const openResume = () => set(true);
export const closeResume = () => set(false);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useResumeOpen = () => useSyncExternalStore(subscribe, () => open, () => false);

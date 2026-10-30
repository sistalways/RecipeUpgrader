import { useCallback, useSyncExternalStore } from "react";

// Module-level store, not per-component state: every caller of useGuestMode
// (App.tsx's gating logic, AppHeader's logo/"Sign in" link) must see the
// same value, and a change from one must be visible to the others
// immediately. Plain useState per component can't do that — each instance
// would have its own copy.
//
// Deliberately in-memory only, never persisted: a fresh page load (or
// clicking the logo) must always land on the login screen rather than
// skipping it because a previous visit's "continue as guest" choice was
// cached. Guest mode only lasts for the current tab's session.
let currentValue = false;
const listeners = new Set<() => void>();

function setValue(value: boolean) {
  currentValue = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentValue;
}

/** Callable outside React too — used by useAuth to clear a stale guest flag on sign-out. */
export function clearGuestMode() {
  setValue(false);
}

export function useGuestMode() {
  const isGuest = useSyncExternalStore(subscribe, getSnapshot);

  const continueAsGuest = useCallback(() => setValue(true), []);
  const exitGuestMode = useCallback(() => setValue(false), []);

  return { isGuest, continueAsGuest, exitGuestMode };
}

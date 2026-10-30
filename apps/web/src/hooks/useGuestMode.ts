import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "recipeupgrader:guestMode";

function readIsGuest(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

// Module-level store, not per-component state: every caller of useGuestMode
// (App.tsx's gating logic, AppHeader's "Sign in" link) must see the same
// value, and a change from one must be visible to the others immediately.
// Plain useState per component can't do that — each instance would have
// its own copy, which was the actual bug here (clicking "Sign in" updated
// AppHeader's copy but App.tsx never found out).
let currentValue = readIsGuest();
const listeners = new Set<() => void>();

function setValue(value: boolean) {
  currentValue = value;
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore — per-viewer convenience only */
  }
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

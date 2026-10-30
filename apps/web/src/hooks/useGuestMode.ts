import { useCallback, useState } from "react";

const STORAGE_KEY = "recipeupgrader:guestMode";

/**
 * Remembers "continue as guest" across reloads so a guest isn't asked
 * again every visit. Per-viewer convenience only — never anything that
 * needs to be read back reliably, so a failed localStorage read/write
 * (private browsing, blocked storage) just means asking again, not a bug.
 */
export function useGuestMode() {
  const [isGuest, setIsGuest] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const continueAsGuest = useCallback(() => {
    setIsGuest(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuest(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { isGuest, continueAsGuest, exitGuestMode };
}

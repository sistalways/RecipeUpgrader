import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient.js";

interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

/**
 * Tracks the current Supabase session, if login is configured at all. When
 * it isn't (supabase is null), this just reports "signed out, not loading"
 * forever, and App.tsx shows a "sign-in isn't configured" message.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: supabase !== null,
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    // If this fails (network/CORS issue reaching Supabase), fall back to
    // "signed out" rather than hanging in "loading" forever, so the person
    // at least sees the sign-in screen and can retry.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setState({ session: data.session, isLoading: false });
      })
      .catch(() => {
        setState({ session: null, isLoading: false });
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, isLoading: false });
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  /**
   * Sends the browser to Google via Supabase. On success the page navigates
   * away, and the session is picked up from the URL when Google sends the
   * person back here.
   */
  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) setAuthError(error.message);
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return {
    isAuthAvailable: supabase !== null,
    session: state.session,
    isLoading: state.isLoading,
    authError,
    signInWithGoogle,
    signOut,
  };
}

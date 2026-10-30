import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { clearGuestMode } from "./useGuestMode.js";
import { supabase } from "../lib/supabaseClient.js";

interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

/**
 * Tracks the current Supabase session, if login is configured at all. When
 * it isn't (supabase is null), this just reports "signed out, not loading"
 * forever - the rest of the UI treats that the same as a guest who hasn't
 * signed in.
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
    // "signed out" rather than hanging in "loading" forever - the guest
    // flow must keep working either way.
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

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }, []);

  /** Returns whether email confirmation is required before the account can sign in. */
  const signUp = useCallback(async (email: string, password: string): Promise<{ needsConfirmation: boolean }> => {
    if (!supabase) return { needsConfirmation: false };
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      return { needsConfirmation: false };
    }
    // Supabase returns no session (but no error) when the project requires
    // email confirmation before a new account can sign in.
    return { needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    // Otherwise a leftover "continue as guest" flag from before this
    // person signed in would skip the login screen on the way back out.
    clearGuestMode();
  }, []);

  return {
    isAuthAvailable: supabase !== null,
    session: state.session,
    isLoading: state.isLoading,
    authError,
    signIn,
    signUp,
    signOut,
  };
}

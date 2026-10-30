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
 * forever — the rest of the UI treats that the same as a guest who hasn't
 * signed in.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: supabase !== null,
  });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    // If this fails (network/CORS issue reaching Supabase), fall back to
    // "signed out" rather than hanging in "loading" forever — the guest
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
    setAuthNotice(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return;
    setAuthError(null);
    setAuthNotice(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
    } else if (!data.session) {
      // Email confirmation is on: no session until they click the link.
      setAuthNotice("Check your email to confirm your account, then sign in.");
    }
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
    authNotice,
    signIn,
    signUp,
    signOut,
  };
}

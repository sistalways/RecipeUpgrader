import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth.js";

/**
 * Login is entirely optional — guest mode is the default and works
 * without this. Renders nothing at all if login isn't configured for
 * this deployment (no Supabase env vars set).
 */
export function AuthPanel() {
  const { isAuthAvailable, session, isLoading, authError, signIn, signUp, signOut } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthAvailable || isLoading) {
    return null;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <span>Signed in as {session.user.email}</span>
        <button onClick={() => void signOut()} className="text-slate-500 underline hover:text-slate-800">
          Sign out
        </button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 text-sm">
      <input
        type="email"
        required
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1"
      />
      <input
        type="password"
        required
        minLength={6}
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-md border border-slate-300 px-2 py-1"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-3 py-1 text-white disabled:opacity-50"
      >
        {mode === "signIn" ? "Sign in" : "Sign up"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        className="text-slate-500 underline"
      >
        {mode === "signIn" ? "Need an account?" : "Have an account?"}
      </button>
      {authError && <span className="text-red-600">{authError}</span>}
    </form>
  );
}

import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth.js";

/**
 * The entry screen: sign in, sign up, or continue as a guest. Shown only
 * when login is configured and there's no active session yet — once
 * either path succeeds, App.tsx stops rendering this and shows the tool.
 */
export function AuthGate({ onContinueAsGuest }: { onContinueAsGuest: () => void }) {
  const { signIn, signUp, authError } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmationMessage(null);
    setIsSubmitting(true);
    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          setConfirmationMessage("Check your email to confirm your account, then sign in.");
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">RecipeUpgrader</h1>
          <p className="text-sm text-slate-600 mt-1">
            Sign in to save your recipes, or continue without an account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {mode === "signIn" ? "Sign in" : "Sign up"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signIn" ? "signUp" : "signIn");
              setConfirmationMessage(null);
            }}
            className="text-sm text-slate-500 underline"
          >
            {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
          {authError && (
            <p className="text-sm text-red-600" role="alert">
              {authError}
            </p>
          )}
          {confirmationMessage && (
            <p className="text-sm text-green-700" role="status">
              {confirmationMessage}
            </p>
          )}
        </form>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex-1 border-t border-slate-200" />
          or
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <button
          onClick={onContinueAsGuest}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
        >
          Continue as guest
        </button>
      </div>
    </main>
  );
}

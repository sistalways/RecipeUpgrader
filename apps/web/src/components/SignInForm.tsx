import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth.js";

/** Email/password sign-in and sign-up, shown on the sign-in page. */
export function SignInForm() {
  const { authError, authNotice, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
      <label className="flex flex-col gap-1 text-slate-700">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-slate-700">
        Password
        <input
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white disabled:opacity-50"
      >
        {mode === "signIn" ? "Sign in" : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        className="text-slate-500 underline hover:text-slate-800"
      >
        {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
      </button>
      {authError && (
        <p className="text-red-600" role="alert">
          {authError}
        </p>
      )}
      {authNotice && (
        <p className="text-slate-600" role="status">
          {authNotice}
        </p>
      )}
    </form>
  );
}

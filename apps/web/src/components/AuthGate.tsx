import { useState, type FormEvent } from "react";
import { Button } from "./Button.js";
import { useAuth } from "../hooks/useAuth.js";

const FEATURES = [
  "Real USDA nutrition data - never an AI's guess",
  "Rewrites your dish, keeps it recognizable",
  "No signup needed to try it",
];

/**
 * The entry screen: the product pitch plus sign in, sign up, or continue
 * as a guest. Shown only when login is configured and there's no active
 * session yet - once either path succeeds, App.tsx stops rendering this
 * and shows the tool.
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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-stone-50 to-stone-50 px-4 py-10 sm:py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 lg:flex-row lg:items-stretch lg:gap-16">
        {/* Pitch */}
        <div className="flex max-w-xl flex-col gap-6 text-center lg:flex-1 lg:text-left">
          <span className="self-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-700 lg:self-start">
            POWERED BY NVIDIA NEMOTRON
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
            Recipe<span className="text-emerald-600">Upgrader</span>
          </h1>
          <p className="text-xl font-semibold text-stone-700">Eat what you love. Hit your macros anyway.</p>
          <p className="text-base leading-relaxed text-stone-600">
            Most "high-protein" recipes online lie about their own numbers - we went looking for a
            better cheesecake and got burned every time. RecipeUpgrader rewrites any dish you crave into
            a version that actually fits your goals, with every gram of protein and every calorie backed
            by real nutrition data, not an AI's guess. Cutting, bulking, or just maintaining - wherever
            you are in your fitness journey, you shouldn't have to choose between your goals and the food
            you actually want to eat.
          </p>
          <ul className="flex flex-col gap-2 self-center text-left text-sm text-stone-600 lg:self-start">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Sign in / sign up / guest */}
        <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-6 shadow-lg shadow-stone-900/5 sm:p-8">
          <div className="mb-5 text-center">
            <h2 className="text-lg font-bold text-stone-900">
              {mode === "signIn" ? "Welcome back" : "Create an account"}
            </h2>
            <p className="mt-1 text-sm text-stone-500">Sign in to save your recipes, or skip it entirely.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {mode === "signIn" ? "Sign in" : "Sign up"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signIn" ? "signUp" : "signIn");
                setConfirmationMessage(null);
              }}
              className="text-sm text-stone-500 underline hover:text-stone-800"
            >
              {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
            </button>
            {authError && (
              <p className="text-sm text-red-600" role="alert">
                {authError}
              </p>
            )}
            {confirmationMessage && (
              <p className="text-sm text-emerald-700" role="status">
                {confirmationMessage}
              </p>
            )}
          </form>

          <div className="my-5 flex items-center gap-2 text-xs text-stone-400">
            <div className="h-px flex-1 bg-stone-200" />
            or
            <div className="h-px flex-1 bg-stone-200" />
          </div>

          <Button variant="secondary" onClick={onContinueAsGuest} className="w-full">
            Continue as guest
          </Button>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Button } from "./Button.js";
import { useAuth } from "../hooks/useAuth.js";

const FEATURES = [
  "Real USDA nutrition data - never an AI's guess",
  "Rewrites your dish, keeps it recognizable",
  "One click to sign in with Google - no password",
];

/**
 * Supabase redirects back here with the error in the URL hash
 * (#error=...&error_code=...&error_description=...) when Google sign-in is
 * cancelled or fails, rather than failing on Supabase's own domain. Reads
 * it once, then strips it from the URL so a reload doesn't keep re-showing
 * it.
 */
function readAndClearRedirectError(): string | null {
  if (typeof window === "undefined" || !window.location.hash) {
    return null;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  if (!params.get("error") && !params.get("error_code") && !params.get("error_description")) {
    return null;
  }

  window.history.replaceState(null, "", window.location.pathname + window.location.search);

  return "Google sign-in didn't finish. Please try again.";
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * The entry screen: the product pitch plus sign in with Google. Shown
 * whenever there's no active session - sign-in is required to use the
 * tool. Once it succeeds, App.tsx stops rendering this and shows the tool.
 */
export function AuthGate() {
  const { signInWithGoogle, authError } = useAuth();
  const [redirectError, setRedirectError] = useState<string | null>(null);

  useEffect(() => {
    const message = readAndClearRedirectError();
    if (message) setRedirectError(message);
  }, []);

  function handleGoogleSignIn() {
    setRedirectError(null);
    void signInWithGoogle();
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
          <p className="text-xl font-semibold text-stone-700">Upgrade your recipe, not your willpower.</p>
          <p className="text-base leading-relaxed text-stone-600">
            Sticking to a diet usually means giving up the food you actually want. RecipeUpgrader
            rewrites any dish you crave into a version that fits your goals, with every gram of protein
            and every calorie backed by real nutrition data, not an AI's guess. Most "high-protein"
            recipes online lie about their own numbers - we went looking for a better cheesecake and got
            burned every time. Cutting, bulking, or just maintaining, the recipe changes so you don't
            have to.
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

        {/* Sign in */}
        <div className="w-full max-w-sm self-center rounded-2xl border border-stone-200 bg-white p-6 shadow-lg shadow-stone-900/5 sm:p-8">
          <div className="mb-5 text-center">
            <h2 className="text-lg font-bold text-stone-900">Get started</h2>
            <p className="mt-1 text-sm text-stone-500">Sign in to upgrade recipes and save them for later.</p>
          </div>

          <Button variant="secondary" onClick={handleGoogleSignIn} className="w-full">
            <GoogleLogo />
            Continue with Google
          </Button>

          {authError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {authError}
            </p>
          )}
          {redirectError && (
            <p className="mt-3 text-sm text-amber-700" role="alert">
              {redirectError}
            </p>
          )}

          <p className="mt-5 text-center text-xs text-stone-400">
            By continuing, you agree to our{" "}
            <a href="/privacy.html" className="underline hover:text-stone-700">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}

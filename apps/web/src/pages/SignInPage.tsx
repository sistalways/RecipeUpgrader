import { SignInForm } from "../components/SignInForm.js";

/**
 * The first screen when login is configured. Guest mode sits right under
 * the form so judges can skip login entirely (PROJECT.md section 1).
 */
export function SignInPage({ onContinueAsGuest }: { onContinueAsGuest: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">RecipeUpgrader</h1>
          <p className="text-sm text-slate-600 mt-1">
            Sign in to save your upgraded recipes.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <SignInForm />
        </section>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          or
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={onContinueAsGuest}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100"
        >
          Continue as guest
        </button>
        <p className="-mt-4 text-center text-xs text-slate-500">
          No account needed — you just can't save recipes.
        </p>
      </div>
    </main>
  );
}

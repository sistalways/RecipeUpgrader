import { RecipeForm } from "../components/RecipeForm.js";
import { ResultView } from "../components/ResultView.js";
import { ApiError } from "../api/upgrade.js";
import { useUpgradeRecipe } from "../hooks/useUpgradeRecipe.js";

export function HomePage() {
  const { mutate, data, isPending, isError, error, reset } = useUpgradeRecipe();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8 flex flex-col items-center gap-8">
      <header className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-slate-900">RecipeUpgrader</h1>
        <p className="text-sm text-slate-600 mt-1">
          Paste a recipe, set your goals, and get a rewritten version that fits — no login required.
        </p>
      </header>

      <RecipeForm
        onSubmit={(request) => {
          reset();
          mutate(request);
        }}
        isSubmitting={isPending}
      />

      {isPending && (
        <p className="text-sm text-slate-500" role="status">
          Parsing your recipe and rewriting it to hit your goals…
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof ApiError ? error.message : "Something went wrong. Please try again."}
        </p>
      )}

      {!isPending && !isError && !data && (
        <p className="text-sm text-slate-400">Your upgraded recipe will show up here.</p>
      )}

      {data && <ResultView result={data} />}
    </main>
  );
}

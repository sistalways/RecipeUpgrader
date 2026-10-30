import { useState } from "react";
import type { UpgradeRequest } from "@recipeupgrader/shared";
import { RecipeForm } from "../components/RecipeForm.js";
import { ResultView } from "../components/ResultView.js";
import { ApiError } from "../api/upgrade.js";
import { useAuth } from "../hooks/useAuth.js";
import { useSaveRecipe } from "../hooks/useSavedRecipes.js";
import { useUpgradeRecipe } from "../hooks/useUpgradeRecipe.js";

export function ToolPage() {
  const { mutate, data, isPending, isError, error, reset } = useUpgradeRecipe();
  const [lastRequest, setLastRequest] = useState<UpgradeRequest | null>(null);

  const { session } = useAuth();
  const accessToken = session?.access_token;
  const saveMutation = useSaveRecipe(accessToken);

  function handleSubmit(request: UpgradeRequest) {
    reset();
    saveMutation.reset();
    setLastRequest(request);
    mutate(request);
  }

  return (
    <main className="flex flex-col items-center gap-8 px-4 py-10 sm:px-8">
      <div className="max-w-xl text-center">
        <h1 className="text-2xl font-bold text-stone-900">Upgrade a recipe</h1>
        <p className="mt-1 text-sm text-stone-600">
          Name a dish, pick your goal, and get a recipe that fits — no login required.
        </p>
      </div>

      <RecipeForm onSubmit={handleSubmit} isSubmitting={isPending} />

      {isPending && (
        <p className="text-sm text-stone-500" role="status">
          Generating your recipe and rewriting it to hit your goals…
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          {error instanceof ApiError ? error.message : "Something went wrong. Please try again."}
        </p>
      )}

      {!isPending && !isError && !data && (
        <p className="text-sm text-stone-400">Your upgraded recipe will show up here.</p>
      )}

      {data && (
        <ResultView
          result={data}
          onSave={
            accessToken && lastRequest
              ? () =>
                  saveMutation.mutate({
                    dishName: lastRequest.dishName,
                    goalMode: lastRequest.goalMode,
                    servings: lastRequest.servings,
                    resolvedGoals: data.resolvedGoals,
                    standard: data.standard,
                    upgraded: data.upgraded,
                  })
              : undefined
          }
          isSaving={saveMutation.isPending}
          isSaved={saveMutation.isSuccess}
        />
      )}
    </main>
  );
}

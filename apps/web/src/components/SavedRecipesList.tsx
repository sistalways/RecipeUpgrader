import type { SavedRecipe } from "@recipeupgrader/shared";
import { useAuth } from "../hooks/useAuth.js";
import { useDeleteSavedRecipe, useSavedRecipes } from "../hooks/useSavedRecipes.js";

function SavedRecipeRow({ recipe, onDelete, isDeleting }: {
  recipe: SavedRecipe;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {recipe.dishName} <span className="text-slate-400">· {recipe.goalMode}</span>
        </p>
        <p className="text-xs text-slate-500">
          {Math.round(recipe.upgraded.macrosPerServing.caloriesKcal)} kcal,{" "}
          {Math.round(recipe.upgraded.macrosPerServing.proteinG)}g protein per serving · serves{" "}
          {recipe.servings}
        </p>
      </div>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="text-xs text-red-600 underline disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}

export function SavedRecipesList() {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const { data, isPending, isError } = useSavedRecipes(accessToken);
  const deleteMutation = useDeleteSavedRecipe(accessToken);

  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-3xl">
      <h2 className="text-base font-semibold text-slate-800">Your saved recipes</h2>

      {isPending && <p className="text-sm text-slate-500">Loading…</p>}
      {isError && <p className="text-sm text-red-600">Couldn't load your saved recipes.</p>}
      {data && data.recipes.length === 0 && (
        <p className="text-sm text-slate-400">Nothing saved yet — upgrade a recipe and save it.</p>
      )}

      {data && data.recipes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {data.recipes.map((recipe) => (
            <SavedRecipeRow
              key={recipe.id}
              recipe={recipe}
              onDelete={() => deleteMutation.mutate(recipe.id)}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === recipe.id}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

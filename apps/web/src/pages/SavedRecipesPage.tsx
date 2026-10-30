import { SavedRecipeCard } from "../components/SavedRecipeCard.js";
import { useAuth } from "../hooks/useAuth.js";
import { useDeleteSavedRecipe, useSavedRecipes } from "../hooks/useSavedRecipes.js";

export function SavedRecipesPage() {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const { data, isPending, isError } = useSavedRecipes(accessToken);
  const deleteMutation = useDeleteSavedRecipe(accessToken);

  return (
    <main className="flex flex-col items-center gap-6 px-4 py-10 sm:px-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-stone-900">Your saved recipes</h1>
        <p className="mt-1 text-sm text-stone-600">Every recipe you've saved, in one place.</p>
      </div>

      <div className="w-full max-w-3xl">
        {isPending && (
          <p className="text-sm text-stone-500" role="status">
            Loading…
          </p>
        )}
        {isError && (
          <p className="text-sm text-red-600" role="alert">
            Couldn't load your saved recipes.
          </p>
        )}
        {data && data.recipes.length === 0 && (
          <p className="text-sm text-stone-400">Nothing saved yet — upgrade a recipe and save it.</p>
        )}

        {data && data.recipes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {data.recipes.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id}
                recipe={recipe}
                onDelete={() => deleteMutation.mutate(recipe.id)}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === recipe.id}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

import type { StandardRecipe, UpgradedRecipe } from "@recipeupgrader/shared";

/**
 * Renders a standard or upgraded recipe as plain text only. Model output
 * is data, never markup - no dangerouslySetInnerHTML, no markdown-with-HTML
 * rendering (PROJECT.md section 6.3).
 */
export function RecipeCard({ recipe }: { recipe: StandardRecipe | UpgradedRecipe }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      {recipe.title && <h3 className="mb-1 text-base font-bold text-stone-900">{recipe.title}</h3>}

      <p className="mb-3 text-xs font-medium text-stone-400">Serves {recipe.servings}</p>

      <ul className="mb-3 flex flex-col gap-1.5 text-sm text-stone-700">
        {recipe.ingredients.map((ingredient, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-emerald-400" />
            <span>
              {ingredient.quantity} {ingredient.unit} {ingredient.name}
              {ingredient.notes ? <span className="text-stone-400"> ({ingredient.notes})</span> : ""}
            </span>
          </li>
        ))}
      </ul>

      {recipe.steps && recipe.steps.length > 0 && (
        <ol className="flex flex-col gap-1.5 text-sm text-stone-700">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex-none font-semibold text-emerald-600">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      )}

      {"substitutionNotes" in recipe && recipe.substitutionNotes && (
        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm italic text-emerald-800">
          {recipe.substitutionNotes}
        </p>
      )}
    </div>
  );
}

import type { StandardRecipe, UpgradedRecipe } from "@recipeupgrader/shared";

/**
 * Renders a standard or upgraded recipe as plain text only. Model output
 * is data, never markup — no dangerouslySetInnerHTML, no markdown-with-HTML
 * rendering (PROJECT.md section 6.3).
 */
export function RecipeCard({ recipe }: { recipe: StandardRecipe | UpgradedRecipe }) {
  return (
    <div className="rounded-md border border-slate-200 p-4">
      {recipe.title && <h3 className="text-sm font-semibold text-slate-800 mb-2">{recipe.title}</h3>}

      <p className="text-xs text-slate-500 mb-2">Serves {recipe.servings}</p>

      <ul className="list-disc pl-5 text-sm space-y-1 mb-3">
        {recipe.ingredients.map((ingredient, i) => (
          <li key={i}>
            {ingredient.quantity} {ingredient.unit} {ingredient.name}
            {ingredient.notes ? ` (${ingredient.notes})` : ""}
          </li>
        ))}
      </ul>

      {recipe.steps && recipe.steps.length > 0 && (
        <ol className="list-decimal pl-5 text-sm space-y-1">
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}

      {"substitutionNotes" in recipe && recipe.substitutionNotes && (
        <p className="mt-3 text-sm text-slate-600 italic">{recipe.substitutionNotes}</p>
      )}
    </div>
  );
}

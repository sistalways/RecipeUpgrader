import { useState } from "react";
import type { GoalMode, SavedRecipe } from "@recipeupgrader/shared";
import { Button } from "./Button.js";
import { MacrosCard } from "./MacrosCard.js";
import { RecipeCard } from "./RecipeCard.js";

const GOAL_BADGE_CLASSES: Record<GoalMode, string> = {
  cutting: "bg-sky-100 text-sky-700",
  maintaining: "bg-stone-200 text-stone-700",
  bulking: "bg-amber-100 text-amber-700",
};

export function SavedRecipeCard({
  recipe,
  onDelete,
  isDeleting,
}: {
  recipe: SavedRecipe;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-900/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-stone-900">{recipe.dishName}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${GOAL_BADGE_CLASSES[recipe.goalMode]}`}
            >
              {recipe.goalMode}
            </span>
          </div>
          <p className="text-sm text-stone-500">
            {Math.round(recipe.upgraded.macrosPerServing.caloriesKcal)} kcal,{" "}
            {Math.round(recipe.upgraded.macrosPerServing.proteinG)}g protein per serving · serves{" "}
            {recipe.servings}
          </p>
        </div>
        <div className="flex flex-none items-center gap-2">
          <Button variant="secondary" onClick={() => setIsExpanded((v) => !v)}>
            {isExpanded ? "Hide recipe" : "View recipe"}
          </Button>
          <Button variant="ghost" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-6 border-t border-stone-200 pt-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-900">Standard recipe</h3>
            <MacrosCard macros={recipe.standard.macrosPerServing} />
            <RecipeCard recipe={recipe.standard.recipe} />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-stone-900">Upgraded recipe</h3>
            <MacrosCard macros={recipe.upgraded.macrosPerServing} />
            <RecipeCard recipe={recipe.upgraded.recipe} />
          </div>
        </div>
      )}
    </li>
  );
}

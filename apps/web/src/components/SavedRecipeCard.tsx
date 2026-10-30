import type { GoalMode, SavedRecipe } from "@recipeupgrader/shared";
import { Button } from "./Button.js";

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
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-900/5">
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
      <Button variant="ghost" onClick={onDelete} disabled={isDeleting} className="flex-none">
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </li>
  );
}

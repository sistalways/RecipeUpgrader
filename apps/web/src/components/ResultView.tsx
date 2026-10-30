import type { UpgradeResponse } from "@recipeupgrader/shared";
import { Button } from "./Button.js";
import { MacrosCard } from "./MacrosCard.js";
import { RecipeCard } from "./RecipeCard.js";

interface ResultViewProps {
  result: UpgradeResponse;
  /** Omit entirely to hide the save button (e.g. not signed in). */
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function ResultView({ result, onSave, isSaving, isSaved }: ResultViewProps) {
  const { resolvedGoals } = result;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div
        className={`rounded-xl px-4 py-3 text-sm font-semibold ${
          result.goalsMet ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {result.goalsMet ? "Goals met ✓" : "Goals not fully met"}
        <p className="mt-1 text-xs font-normal opacity-80">
          Target: {resolvedGoals.caloriesPerServing} kcal and at least {resolvedGoals.minProteinPerServingG}g
          protein per serving.
        </p>
        {result.notes && <p className="mt-1 text-xs font-normal opacity-80">{result.notes}</p>}
      </div>

      {onSave && (
        <Button variant="secondary" onClick={onSave} disabled={isSaving || isSaved} className="self-start">
          {isSaved ? "Saved ✓" : isSaving ? "Saving…" : "Save this recipe"}
        </Button>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-stone-900">Standard recipe</h2>
          <MacrosCard title="Macros (per serving)" macros={result.standard.macrosPerServing} />
          <RecipeCard recipe={result.standard.recipe} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-stone-900">Upgraded recipe</h2>
          <MacrosCard title="Macros (per serving)" macros={result.upgraded.macrosPerServing} />
          <RecipeCard recipe={result.upgraded.recipe} />
        </div>
      </div>
    </div>
  );
}

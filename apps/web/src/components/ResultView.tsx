import type { UpgradeResponse } from "@recipeupgrader/shared";
import { Button } from "./Button.js";
import { MacrosCard } from "./MacrosCard.js";
import { NearbyStoresCard } from "./NearbyStoresCard.js";
import { RecipeCard } from "./RecipeCard.js";

interface ResultViewProps {
  result: UpgradeResponse;
  /** Omit entirely to hide the save button (e.g. not signed in). */
  onSave?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
}

export function ResultView({ result, onSave, isSaving, isSaved }: ResultViewProps) {
  const caloriesDelta = Math.round(
    result.upgraded.macrosPerServing.caloriesKcal - result.standard.macrosPerServing.caloriesKcal,
  );
  const proteinDelta = Math.round(
    result.upgraded.macrosPerServing.proteinG - result.standard.macrosPerServing.proteinG,
  );

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        {caloriesDelta <= 0
          ? `${Math.abs(caloriesDelta)} fewer calories`
          : `${caloriesDelta} more calories`}{" "}
        · {proteinDelta >= 0 ? `+${proteinDelta}g protein` : `${proteinDelta}g protein`} vs. the standard
        recipe
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
          <MacrosCard macros={result.standard.macrosPerServing} />
          <RecipeCard recipe={result.standard.recipe} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-stone-900">Upgraded recipe</h2>
          <MacrosCard macros={result.upgraded.macrosPerServing} />
          <RecipeCard recipe={result.upgraded.recipe} />
        </div>
      </div>

      {result.stores &&
        (result.stores.length > 0 ? (
          <NearbyStoresCard stores={result.stores} availability={result.availability} />
        ) : (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
            Couldn't find any grocery stores near that location.
          </div>
        ))}
    </div>
  );
}

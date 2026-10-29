import type { UpgradeResponse } from "@recipeupgrader/shared";
import { MacrosCard } from "./MacrosCard.js";
import { RecipeCard } from "./RecipeCard.js";

export function ResultView({ result }: { result: UpgradeResponse }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl">
      <div
        className={`rounded-md px-4 py-2 text-sm font-medium ${
          result.goalsMet ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
        }`}
      >
        {result.goalsMet ? "Goals met ✓" : "Goals not fully met"}
        {result.notes && <p className="mt-1 font-normal">{result.notes}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-slate-800">Original</h2>
          <MacrosCard title="Macros (per serving)" macros={result.original.macrosPerServing} />
          <RecipeCard recipe={result.original.parsed} />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-slate-800">Upgraded</h2>
          <MacrosCard title="Macros (per serving)" macros={result.upgraded.macrosPerServing} />
          <RecipeCard recipe={result.upgraded.recipe} />
        </div>
      </div>
    </div>
  );
}

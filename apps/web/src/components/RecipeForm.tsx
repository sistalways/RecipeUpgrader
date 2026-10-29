import { useState, type FormEvent } from "react";
import type { UpgradeRequest } from "@recipeupgrader/shared";
import { MAX_RECIPE_TEXT_LENGTH } from "@recipeupgrader/shared";

interface RecipeFormProps {
  onSubmit: (request: UpgradeRequest) => void;
  isSubmitting: boolean;
}

export function RecipeForm({ onSubmit, isSubmitting }: RecipeFormProps) {
  const [recipeText, setRecipeText] = useState("");
  const [caloriesPerServing, setCaloriesPerServing] = useState(500);
  const [minProteinPerServingG, setMinProteinPerServingG] = useState(30);
  const [servings, setServings] = useState(2);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (recipeText.trim().length === 0) {
      setFormError("Paste a recipe first.");
      return;
    }

    setFormError(null);
    onSubmit({
      recipeText,
      goals: { caloriesPerServing, minProteinPerServingG, servings },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">Paste your recipe</span>
        <textarea
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          maxLength={MAX_RECIPE_TEXT_LENGTH}
          rows={10}
          placeholder="e.g. 2 chicken breasts, 1 cup rice, ..."
          className="rounded-md border border-slate-300 p-3 text-sm focus:border-slate-500 focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Calories / serving</span>
          <input
            type="number"
            min={100}
            max={5000}
            value={caloriesPerServing}
            onChange={(e) => setCaloriesPerServing(Number(e.target.value))}
            className="rounded-md border border-slate-300 p-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Min protein (g) / serving</span>
          <input
            type="number"
            min={0}
            max={500}
            value={minProteinPerServingG}
            onChange={(e) => setMinProteinPerServingG(Number(e.target.value))}
            className="rounded-md border border-slate-300 p-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-700">Servings</span>
          <input
            type="number"
            min={1}
            max={100}
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="rounded-md border border-slate-300 p-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </label>
      </div>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isSubmitting ? "Upgrading…" : "Upgrade recipe"}
      </button>
    </form>
  );
}

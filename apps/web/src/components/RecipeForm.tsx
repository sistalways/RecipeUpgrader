import { useState, type FormEvent } from "react";
import type { GoalMode, UpgradeRequest } from "@recipeupgrader/shared";
import { MAX_DISH_NAME_LENGTH } from "@recipeupgrader/shared";

interface RecipeFormProps {
  onSubmit: (request: UpgradeRequest) => void;
  isSubmitting: boolean;
}

const GOAL_MODES: { value: GoalMode; label: string; description: string }[] = [
  { value: "cutting", label: "Cutting", description: "Lower calories, high protein" },
  { value: "maintaining", label: "Maintaining", description: "Balanced calories and protein" },
  { value: "bulking", label: "Bulking", description: "Higher calories, high protein" },
];

export function RecipeForm({ onSubmit, isSubmitting }: RecipeFormProps) {
  const [dishName, setDishName] = useState("");
  const [goalMode, setGoalMode] = useState<GoalMode>("maintaining");
  const [servings, setServings] = useState(2);
  const [formError, setFormError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (dishName.trim().length === 0) {
      setFormError("Enter a dish name first.");
      return;
    }

    setFormError(null);
    onSubmit({ dishName, goalMode, servings });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-700">What do you want to make?</span>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          maxLength={MAX_DISH_NAME_LENGTH}
          placeholder="e.g. cheesecake"
          className="rounded-md border border-slate-300 p-3 text-sm focus:border-slate-500 focus:outline-none"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-slate-700 mb-1">Goal</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {GOAL_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex flex-col gap-0.5 rounded-md border p-3 text-sm cursor-pointer ${
                goalMode === mode.value
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-300"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <input
                  type="radio"
                  name="goalMode"
                  value={mode.value}
                  checked={goalMode === mode.value}
                  onChange={() => setGoalMode(mode.value)}
                />
                {mode.label}
              </span>
              <span className="text-xs text-slate-500">{mode.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 max-w-[10rem]">
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

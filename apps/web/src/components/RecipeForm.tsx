import { useState, type FormEvent } from "react";
import type { GoalMode, UpgradeRequest } from "@recipeupgrader/shared";
import { MAX_DISH_NAME_LENGTH } from "@recipeupgrader/shared";
import { Button } from "./Button.js";

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
  const [servings, setServings] = useState(1);
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
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-xl flex-col gap-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm shadow-stone-900/5 sm:p-8"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">What do you want to make?</span>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          maxLength={MAX_DISH_NAME_LENGTH}
          placeholder="e.g. cheesecake"
          disabled={isSubmitting}
          className="rounded-lg border border-stone-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-50 disabled:text-stone-400"
        />
      </label>

      <fieldset
        disabled={isSubmitting}
        className={`flex flex-col gap-2 ${isSubmitting ? "opacity-60" : ""}`}
      >
        <legend className="mb-1 text-sm font-semibold text-stone-800">Goal</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {GOAL_MODES.map((mode) => (
            <label
              key={mode.value}
              className={`flex flex-col gap-0.5 rounded-xl border-2 p-3 text-sm transition-colors ${
                isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
              } ${
                goalMode === mode.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-stone-800">
                <input
                  type="radio"
                  name="goalMode"
                  value={mode.value}
                  checked={goalMode === mode.value}
                  onChange={() => setGoalMode(mode.value)}
                  className="accent-emerald-600"
                />
                {mode.label}
              </span>
              <span className="text-xs text-stone-500">{mode.description}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-semibold text-stone-800">Servings</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting || servings <= 1}
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            aria-label="Decrease servings"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-stone-300 text-lg font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={100}
            value={servings}
            disabled={isSubmitting}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              setServings(Number.isFinite(parsed) ? Math.min(100, Math.max(1, parsed)) : 1);
            }}
            className="w-16 rounded-lg border border-stone-300 p-2.5 text-center text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-50 disabled:text-stone-400"
          />
          <button
            type="button"
            disabled={isSubmitting || servings >= 100}
            onClick={() => setServings((s) => Math.min(100, s + 1))}
            aria-label="Increase servings"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-stone-300 text-lg font-semibold text-stone-700 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {formError && (
        <p className="text-sm text-red-600" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full py-2.5 text-base">
        {isSubmitting ? "Upgrading…" : "Upgrade recipe"}
      </Button>
    </form>
  );
}

import type { Goals, Macros } from "@recipeupgrader/shared";

/** Calories are allowed to come in slightly under the "upper bound" goal before we call it a miss. */
const CALORIE_TOLERANCE_FACTOR = 1.05;

/**
 * Pure nutrition math. No I/O, so it is trivial to unit test
 * (PROJECT.md section 3 and 5 "Testing"). Macros numbers always come from
 * USDA data (per-100g figures) scaled by actual grams used; the LLM never
 * contributes a number here.
 */

export function scaleMacrosByGrams(per100g: Macros, grams: number): Macros {
  const factor = grams / 100;
  return {
    caloriesKcal: per100g.caloriesKcal * factor,
    proteinG: per100g.proteinG * factor,
    carbsG: per100g.carbsG * factor,
    fatG: per100g.fatG * factor,
  };
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce<Macros>(
    (total, m) => ({
      caloriesKcal: total.caloriesKcal + m.caloriesKcal,
      proteinG: total.proteinG + m.proteinG,
      carbsG: total.carbsG + m.carbsG,
      fatG: total.fatG + m.fatG,
    }),
    { caloriesKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
  );
}

export function macrosPerServing(total: Macros, servings: number): Macros {
  if (servings <= 0) {
    throw new RangeError("servings must be positive");
  }
  return {
    caloriesKcal: total.caloriesKcal / servings,
    proteinG: total.proteinG / servings,
    carbsG: total.carbsG / servings,
    fatG: total.fatG / servings,
  };
}

/**
 * Whether a per-serving macro result hits the user's goals: calories at or
 * under a small tolerance above the target, protein at or above the
 * minimum. Used to decide the response's `goalsMet` flag — never faked
 * (PROJECT.md section 2 step 7).
 */
export function meetsGoals(macros: Macros, goals: Goals): boolean {
  return (
    macros.caloriesKcal <= goals.caloriesPerServing * CALORIE_TOLERANCE_FACTOR &&
    macros.proteinG >= goals.minProteinPerServingG
  );
}

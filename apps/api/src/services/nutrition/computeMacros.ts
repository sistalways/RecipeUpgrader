import type { Ingredient, Macros } from "@recipeupgrader/shared";
import { macrosPerServing, scaleMacrosByGrams, sumMacros } from "./macroMath.js";
import { toGrams } from "./unitConversion.js";
import { searchUsdaFood } from "./usda.js";

export interface ComputeMacrosResult {
  macrosPerServing: Macros;
  /** Ingredient names with no USDA match; their contribution was treated as zero. Surfaced to the caller, never hidden. */
  unmatchedIngredients: string[];
}

/**
 * Looks up every ingredient in USDA FoodData Central, converts its quantity
 * to grams, scales macros, sums across the recipe, and divides by
 * servings. All the math is delegated to the pure functions in
 * macroMath.ts; this function's only job is the I/O and wiring
 * (PROJECT.md section 3: "Nutrition math is pure functions with no I/O").
 */
export async function computeMacros(
  ingredients: Ingredient[],
  servings: number,
): Promise<ComputeMacrosResult> {
  const unmatchedIngredients: string[] = [];

  const perIngredientMacros = await Promise.all(
    ingredients.map(async (ingredient) => {
      const match = await searchUsdaFood(ingredient.name);
      if (!match) {
        unmatchedIngredients.push(ingredient.name);
        return { caloriesKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 };
      }
      const grams = toGrams(ingredient.quantity, ingredient.unit);
      return scaleMacrosByGrams(match.macrosPer100g, grams);
    }),
  );

  const total = sumMacros(perIngredientMacros);

  return {
    macrosPerServing: macrosPerServing(total, servings),
    unmatchedIngredients,
  };
}

import type { Unit } from "@recipeupgrader/shared";

/**
 * Converts a metric quantity to grams. Mass units (g/kg) are exact.
 * Volume units (ml/l) assume a water-like density (1 ml ≈ 1 g), which is a
 * reasonable approximation for genuine liquids (milk, oil, stock) - the
 * schema no longer allows cups/tbsp/tsp, so this is never asked to
 * approximate a dry ingredient's density, which was the real source of
 * error.
 */
const GRAMS_PER_UNIT: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
};

export function toGrams(quantity: number, unit: Unit): number {
  return quantity * GRAMS_PER_UNIT[unit];
}

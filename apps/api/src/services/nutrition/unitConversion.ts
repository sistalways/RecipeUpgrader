/**
 * Approximate quantity → grams conversion for macro math. This is a
 * deliberate simplification for the hackathon: volume-to-weight assumes
 * roughly water-like density, and unrecognized "count" units (e.g. "whole",
 * "clove", "slice") fall back to a flat average weight. Good enough to get
 * directionally correct macros; not a substitute for a real density table.
 */

const GRAMS_PER_UNIT: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  cup: 236.588,
  cups: 236.588,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
};

/** Fallback weight (grams) for count-style units we don't recognize, e.g. "whole", "clove", "slice". */
export const DEFAULT_COUNT_UNIT_GRAMS = 50;

export function toGrams(quantity: number, unit: string): number {
  const key = unit.trim().toLowerCase();
  const perUnit = GRAMS_PER_UNIT[key];
  if (perUnit !== undefined) {
    return quantity * perUnit;
  }
  return quantity * DEFAULT_COUNT_UNIT_GRAMS;
}

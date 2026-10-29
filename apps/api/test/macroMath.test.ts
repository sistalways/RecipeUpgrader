import { describe, expect, it } from "vitest";
import {
  macrosPerServing,
  meetsGoals,
  scaleMacrosByGrams,
  sumMacros,
} from "../src/services/nutrition/macroMath.js";

const chickenPer100g = { caloriesKcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 };

describe("scaleMacrosByGrams", () => {
  it("scales linearly from a per-100g baseline", () => {
    expect(scaleMacrosByGrams(chickenPer100g, 200)).toEqual({
      caloriesKcal: 330,
      proteinG: 62,
      carbsG: 0,
      fatG: 7.2,
    });
  });

  it("returns all zeros for zero grams", () => {
    expect(scaleMacrosByGrams(chickenPer100g, 0)).toEqual({
      caloriesKcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
    });
  });
});

describe("sumMacros", () => {
  it("sums an empty list to all zeros", () => {
    expect(sumMacros([])).toEqual({ caloriesKcal: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });

  it("adds macros across multiple ingredients", () => {
    const a = { caloriesKcal: 100, proteinG: 10, carbsG: 5, fatG: 2 };
    const b = { caloriesKcal: 50, proteinG: 2, carbsG: 8, fatG: 1 };
    expect(sumMacros([a, b])).toEqual({ caloriesKcal: 150, proteinG: 12, carbsG: 13, fatG: 3 });
  });
});

describe("macrosPerServing", () => {
  it("divides totals evenly across servings", () => {
    const total = { caloriesKcal: 400, proteinG: 40, carbsG: 20, fatG: 8 };
    expect(macrosPerServing(total, 4)).toEqual({
      caloriesKcal: 100,
      proteinG: 10,
      carbsG: 5,
      fatG: 2,
    });
  });

  it("throws for zero or negative servings", () => {
    const total = { caloriesKcal: 100, proteinG: 10, carbsG: 5, fatG: 2 };
    expect(() => macrosPerServing(total, 0)).toThrow(RangeError);
    expect(() => macrosPerServing(total, -1)).toThrow(RangeError);
  });
});

describe("meetsGoals", () => {
  const goals = { caloriesPerServing: 500, minProteinPerServingG: 30, servings: 2 };

  it("is true when within calorie tolerance and protein minimum is hit", () => {
    expect(meetsGoals({ caloriesKcal: 500, proteinG: 30, carbsG: 0, fatG: 0 }, goals)).toBe(true);
    expect(meetsGoals({ caloriesKcal: 520, proteinG: 35, carbsG: 0, fatG: 0 }, goals)).toBe(true);
  });

  it("is false when calories exceed tolerance", () => {
    expect(meetsGoals({ caloriesKcal: 600, proteinG: 30, carbsG: 0, fatG: 0 }, goals)).toBe(false);
  });

  it("is false when protein is under the minimum", () => {
    expect(meetsGoals({ caloriesKcal: 400, proteinG: 20, carbsG: 0, fatG: 0 }, goals)).toBe(false);
  });
});

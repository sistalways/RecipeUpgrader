import { describe, expect, it } from "vitest";
import { goalModeToGoals } from "../src/services/recipe/goalPresets.js";

describe("goalModeToGoals", () => {
  it("resolves each goal mode to a distinct calorie/protein target", () => {
    const cutting = goalModeToGoals("cutting", 2);
    const maintaining = goalModeToGoals("maintaining", 2);
    const bulking = goalModeToGoals("bulking", 2);

    expect(cutting.caloriesPerServing).toBeLessThan(maintaining.caloriesPerServing);
    expect(maintaining.caloriesPerServing).toBeLessThan(bulking.caloriesPerServing);
    expect(cutting.minProteinPerServingG).toBeGreaterThan(0);
    expect(bulking.minProteinPerServingG).toBeGreaterThanOrEqual(maintaining.minProteinPerServingG);
  });

  it("passes the requested servings through unchanged", () => {
    expect(goalModeToGoals("maintaining", 5).servings).toBe(5);
  });
});

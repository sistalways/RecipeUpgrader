import type { Goals, GoalMode } from "@recipeupgrader/shared";

/**
 * Per-serving calorie/protein targets for each goal mode. Pure lookup, no
 * LLM involved — trivial to unit test and to tune (PROJECT.md section 2
 * step 2/3). These are deliberately flat, dish-agnostic heuristics for the
 * hackathon MVP: a real version would vary by meal type, body weight, and
 * daily targets rather than a single number per mode.
 */
const CALORIES_PER_SERVING: Record<GoalMode, number> = {
  cutting: 350,
  maintaining: 500,
  bulking: 700,
};

const MIN_PROTEIN_PER_SERVING_G: Record<GoalMode, number> = {
  cutting: 25,
  maintaining: 20,
  bulking: 30,
};

export function goalModeToGoals(goalMode: GoalMode, servings: number): Goals {
  return {
    caloriesPerServing: CALORIES_PER_SERVING[goalMode],
    minProteinPerServingG: MIN_PROTEIN_PER_SERVING_G[goalMode],
    servings,
  };
}

import { MAX_DISH_NAME_LENGTH, StandardRecipeSchema, type StandardRecipe } from "@recipeupgrader/shared";
import { env } from "../../config.js";
import { sanitizeUntrustedText } from "../../security/sanitize.js";
import { callModel } from "../llm/callModel.js";
import { buildGenerateBaseRecipePrompt } from "../llm/prompts/generateBaseRecipe.js";

/**
 * Generates a standard, typical recipe for a dish name at the requested
 * serving count, using the fast model. This is the "before" baseline for
 * the upgrade - the dish name is untrusted user input and is sanitized
 * before it ever reaches a prompt (PROJECT.md section 6.3).
 */
export async function generateBaseRecipe(dishName: string, servings: number): Promise<StandardRecipe> {
  const sanitizedDishName = sanitizeUntrustedText(dishName, MAX_DISH_NAME_LENGTH);
  const { system, user } = buildGenerateBaseRecipePrompt({ sanitizedDishName, servings });

  return callModel({
    task: "generateBaseRecipe",
    model: env.MODEL_FAST,
    system,
    user,
    schema: StandardRecipeSchema,
  });
}

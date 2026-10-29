import type {
  Availability,
  Goals,
  Macros,
  ParsedRecipe,
  UpgradedRecipe,
} from "@recipeupgrader/shared";
import { UpgradedRecipeSchema } from "@recipeupgrader/shared";
import { env } from "../../config.js";
import { callModel } from "../llm/callModel.js";
import { buildRewriteRecipePrompt } from "../llm/prompts/rewriteRecipe.js";

/**
 * Rewrites a parsed recipe to hit calorie/protein goals, using the
 * reasoning model. `availability`, when present, is already-condensed
 * structured data (never raw web text) per PROJECT.md section 6.3.
 */
export async function rewriteRecipe(params: {
  original: ParsedRecipe;
  originalMacros: Macros;
  goals: Goals;
  availability?: Availability[];
}): Promise<UpgradedRecipe> {
  const { original, originalMacros, goals, availability = [] } = params;
  const { system, user } = buildRewriteRecipePrompt({
    original,
    originalMacros,
    goals,
    availability,
  });

  return callModel({
    task: "rewriteRecipe",
    model: env.MODEL_REASONING,
    system,
    user,
    schema: UpgradedRecipeSchema,
  });
}

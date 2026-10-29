import { MAX_RECIPE_TEXT_LENGTH, ParsedRecipeSchema, type ParsedRecipe } from "@recipeupgrader/shared";
import { env } from "../../config.js";
import { sanitizeUntrustedText } from "../../security/sanitize.js";
import { callModel } from "../llm/callModel.js";
import { buildParseRecipePrompt } from "../llm/prompts/parseRecipe.js";

/**
 * Parses free-form recipe text into structured ingredients, using the fast
 * model. The raw text is untrusted input: it is sanitized before it ever
 * reaches a prompt (PROJECT.md section 6.3).
 */
export async function parseRecipe(recipeText: string): Promise<ParsedRecipe> {
  const sanitized = sanitizeUntrustedText(recipeText, MAX_RECIPE_TEXT_LENGTH);
  const { system, user } = buildParseRecipePrompt(sanitized);

  return callModel({
    task: "parseRecipe",
    model: env.MODEL_FAST,
    system,
    user,
    schema: ParsedRecipeSchema,
  });
}

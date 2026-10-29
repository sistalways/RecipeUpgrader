import type { FastifyInstance } from "fastify";
import { UpgradeRequestSchema, UpgradeResponseSchema } from "@recipeupgrader/shared";
import { ValidationError } from "../lib/errors.js";
import { computeMacros } from "../services/nutrition/computeMacros.js";
import { meetsGoals } from "../services/nutrition/macroMath.js";
import { parseRecipe } from "../services/recipe/parseRecipe.js";
import { rewriteRecipe } from "../services/recipe/rewriteRecipe.js";

/**
 * POST /api/upgrade — the main pipeline (PROJECT.md section 2):
 * validate → parse → compute macros → (location: not yet wired, see below)
 * → rewrite → recompute macros → respond. Route stays thin; all logic
 * lives in services/.
 *
 * Location/availability (steps 5–6 of the lifecycle) are not implemented
 * yet — that is tomorrow's work per the project plan. Per PROJECT.md,
 * "Location failure or absence is never an error", so for now we always
 * fall back to a plain rewrite with no availability data, which is a valid
 * instance of that fallback path, not a shortcut around it.
 */
export function registerUpgradeRoute(app: FastifyInstance): void {
  app.post(
    "/api/upgrade",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "10 minutes",
        },
      },
    },
    async (request, reply) => {
      const parsedBody = UpgradeRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        throw new ValidationError("Request body did not match the expected shape");
      }
      const { recipeText, goals } = parsedBody.data;

      const startedAt = Date.now();

      const originalParsed = await parseRecipe(recipeText);
      const { macrosPerServing: originalMacros, unmatchedIngredients: originalUnmatched } =
        await computeMacros(originalParsed.ingredients, originalParsed.servings);

      const upgradedRecipe = await rewriteRecipe({
        original: originalParsed,
        originalMacros,
        goals,
        availability: [],
      });
      const { macrosPerServing: upgradedMacros, unmatchedIngredients: upgradedUnmatched } =
        await computeMacros(upgradedRecipe.ingredients, upgradedRecipe.servings);

      const goalsMet = meetsGoals(upgradedMacros, goals);
      const unmatched = [...new Set([...originalUnmatched, ...upgradedUnmatched])];
      const notes = !goalsMet
        ? "The rewritten recipe did not fully meet the requested goals."
        : unmatched.length > 0
          ? `Some ingredients had no nutrition match and were treated as 0 calories/protein: ${unmatched.join(", ")}.`
          : undefined;

      const response = UpgradeResponseSchema.parse({
        original: { parsed: originalParsed, macrosPerServing: originalMacros },
        upgraded: { recipe: upgradedRecipe, macrosPerServing: upgradedMacros },
        goalsMet,
        notes,
      });

      request.log.info({
        route: "upgrade",
        latencyMs: Date.now() - startedAt,
        goalsMet,
        unmatchedCount: unmatched.length,
      });

      return reply.send(response);
    },
  );
}

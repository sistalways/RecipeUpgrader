import type { FastifyInstance, FastifyRequest } from "fastify";
import { UpgradeRequestSchema, UpgradeResponseSchema } from "@recipeupgrader/shared";
import { RateLimitError, ValidationError } from "../lib/errors.js";
import { requireAuth } from "../security/auth.js";
import { computeMacros } from "../services/nutrition/computeMacros.js";
import { meetsGoals } from "../services/nutrition/macroMath.js";
import { resolveAvailability } from "../services/location/resolveAvailability.js";
import { generateBaseRecipe } from "../services/recipe/generateBaseRecipe.js";
import { goalModeToGoals } from "../services/recipe/goalPresets.js";
import { rewriteRecipe } from "../services/recipe/rewriteRecipe.js";

/**
 * POST /api/upgrade - the main pipeline (PROJECT.md section 2):
 * auth → per-user rate limit → validate → resolve goals from goal mode →
 * generate a standard recipe for the dish name → compute its macros → (if
 * location given) find nearby availability → rewrite → recompute macros →
 * respond. Route stays thin; all logic lives in services/.
 *
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9). Sign-in is
 * required, so the paid model calls can't be reached anonymously.
 */
export function registerUpgradeRoute(app: FastifyInstance): void {
  // Runs after requireAuth, so it counts per verified user rather than per
  // IP. The global per-IP limit in server.ts still applies on top of this,
  // including to requests that fail auth. createRateLimit (not rateLimit)
  // because the plugin's hook-style handler skips any request the global
  // limit has already checked, which would make this limit a silent no-op.
  const checkUserLimit = app.createRateLimit({
    max: 10,
    timeWindow: "10 minutes",
    keyGenerator: (request) => `user:${request.user?.id ?? request.ip}`,
  });
  const perUserRateLimit = async (request: FastifyRequest) => {
    const result = await checkUserLimit(request);
    if (!result.isAllowed && result.isExceeded) {
      throw new RateLimitError();
    }
  };

  app.post(
    "/api/upgrade",
    { preHandler: [requireAuth, perUserRateLimit] },
    async (request, reply) => {
      const parsedBody = UpgradeRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        throw new ValidationError("Request body did not match the expected shape");
      }
      const { dishName, goalMode, servings, location } = parsedBody.data;

      const startedAt = Date.now();

      const goals = goalModeToGoals(goalMode, servings);

      const standardRecipe = await generateBaseRecipe(dishName, servings);
      const { macrosPerServing: standardMacros, unmatchedIngredients: standardUnmatched } =
        await computeMacros(standardRecipe.ingredients, standardRecipe.servings);

      const { stores, availability } = location
        ? await resolveAvailability(location)
        : { stores: [], availability: [] };

      const upgradedRecipe = await rewriteRecipe({
        original: standardRecipe,
        originalMacros: standardMacros,
        goals,
        availability,
      });
      const { macrosPerServing: upgradedMacros, unmatchedIngredients: upgradedUnmatched } =
        await computeMacros(upgradedRecipe.ingredients, upgradedRecipe.servings);

      const goalsMet = meetsGoals(upgradedMacros, goals);
      const unmatched = [...new Set([...standardUnmatched, ...upgradedUnmatched])];
      const notes = !goalsMet
        ? "The rewritten recipe did not fully meet the requested goals."
        : unmatched.length > 0
          ? `Some ingredients had no nutrition match and were treated as 0 calories/protein: ${unmatched.join(", ")}.`
          : undefined;

      const response = UpgradeResponseSchema.parse({
        resolvedGoals: goals,
        standard: { recipe: standardRecipe, macrosPerServing: standardMacros },
        upgraded: { recipe: upgradedRecipe, macrosPerServing: upgradedMacros },
        goalsMet,
        notes,
        // Included (even as empty arrays) whenever a location was given, so
        // the frontend can distinguish "no location shared" (omitted) from
        // "shared, but nothing was found" (empty array) - otherwise a
        // lookup failure looks identical to the user never sharing a
        // location at all.
        availability: location ? availability : undefined,
        stores: location ? stores : undefined,
      });

      request.log.info({
        route: "upgrade",
        goalMode,
        latencyMs: Date.now() - startedAt,
        goalsMet,
        unmatchedCount: unmatched.length,
        locationGiven: Boolean(location),
        storeCount: stores.length,
        availabilityCount: availability.length,
      });

      return reply.send(response);
    },
  );
}

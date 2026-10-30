import type { FastifyInstance } from "fastify";
import { ListSavedRecipesResponseSchema, SaveRecipeRequestSchema, SavedRecipeSchema } from "@recipeupgrader/shared";
import { z } from "zod";
import { ValidationError } from "../lib/errors.js";
import { getAuthenticatedUser, requireAuth } from "../security/auth.js";
import { deleteSavedRecipe, listSavedRecipes, saveRecipe } from "../services/recipes/savedRecipes.js";

const IdParamsSchema = z.object({ id: z.string().uuid() }).strict();

/**
 * Saved-recipe routes. All three require auth — guests never reach these
 * (guest mode works entirely through /api/upgrade, no account needed).
 */
export function registerRecipesRoute(app: FastifyInstance): void {
  app.post(
    "/api/recipes",
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsedBody = SaveRecipeRequestSchema.safeParse(request.body);
      if (!parsedBody.success) {
        throw new ValidationError("Request body did not match the expected shape");
      }

      const user = getAuthenticatedUser(request);
      const saved = await saveRecipe(user.accessToken, user.id, parsedBody.data);
      return reply.status(201).send(SavedRecipeSchema.parse(saved));
    },
  );

  app.get("/api/recipes", { preHandler: requireAuth }, async (request, reply) => {
    const user = getAuthenticatedUser(request);
    const recipes = await listSavedRecipes(user.accessToken);
    return reply.send(ListSavedRecipesResponseSchema.parse({ recipes }));
  });

  app.delete(
    "/api/recipes/:id",
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsedParams = IdParamsSchema.safeParse(request.params);
      if (!parsedParams.success) {
        throw new ValidationError("Invalid recipe id");
      }

      const user = getAuthenticatedUser(request);
      await deleteSavedRecipe(user.accessToken, parsedParams.data.id);
      return reply.status(204).send();
    },
  );
}

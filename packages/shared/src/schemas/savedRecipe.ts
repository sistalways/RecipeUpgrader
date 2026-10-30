import { z } from "zod";
import { GoalModeSchema, GoalsSchema, StandardWithMacrosSchema, UpgradedWithMacrosSchema } from "./upgrade.js";
import { MAX_DISH_NAME_LENGTH } from "./recipe.js";

/**
 * Body for POST /api/recipes. Mirrors UpgradeResponseSchema's "standard"
 * and "upgraded" shapes exactly, plus the original request fields - the
 * frontend already has all of this from the /api/upgrade call that
 * produced it, so saving is just resubmitting what was already shown.
 */
export const SaveRecipeRequestSchema = z
  .object({
    dishName: z.string().trim().min(1).max(MAX_DISH_NAME_LENGTH),
    goalMode: GoalModeSchema,
    servings: z.number().int().positive().max(100),
    resolvedGoals: GoalsSchema,
    standard: StandardWithMacrosSchema,
    upgraded: UpgradedWithMacrosSchema,
  })
  .strict();

export type SaveRecipeRequest = z.infer<typeof SaveRecipeRequestSchema>;

export const SavedRecipeSchema = z
  .object({
    id: z.string().uuid(),
    dishName: z.string(),
    goalMode: GoalModeSchema,
    servings: z.number().int().positive(),
    resolvedGoals: GoalsSchema,
    standard: StandardWithMacrosSchema,
    upgraded: UpgradedWithMacrosSchema,
    createdAt: z.string(),
  })
  .strict();

export type SavedRecipe = z.infer<typeof SavedRecipeSchema>;

export const ListSavedRecipesResponseSchema = z
  .object({
    recipes: z.array(SavedRecipeSchema).max(200),
  })
  .strict();

export type ListSavedRecipesResponse = z.infer<typeof ListSavedRecipesResponseSchema>;

import { z } from "zod";
import { MAX_DISH_NAME_LENGTH, StandardRecipeSchema, UpgradedRecipeSchema } from "./recipe.js";
import { AvailabilitySchema, LocationInputSchema } from "./location.js";
import { MacrosSchema } from "./macros.js";

/**
 * The user's fitness goal for this recipe. Maps to a calorie/protein target
 * per serving in code (apps/api/src/services/recipe/goalPresets.ts) — the
 * user picks a mode, not raw numbers.
 */
export const GoalModeSchema = z.enum(["cutting", "maintaining", "bulking"]);

export type GoalMode = z.infer<typeof GoalModeSchema>;

/**
 * Goals the rewritten recipe should hit, always expressed per serving.
 * Resolved server-side from a GoalMode; never supplied directly by the
 * client.
 */
export const GoalsSchema = z
  .object({
    caloriesPerServing: z.number().min(100).max(5_000),
    minProteinPerServingG: z.number().min(0).max(500),
    servings: z.number().int().positive().max(100),
  })
  .strict();

export type Goals = z.infer<typeof GoalsSchema>;

export const UpgradeRequestSchema = z
  .object({
    dishName: z.string().trim().min(1).max(MAX_DISH_NAME_LENGTH),
    goalMode: GoalModeSchema,
    servings: z.number().int().positive().max(100),
    location: LocationInputSchema.optional(),
  })
  .strict();

export type UpgradeRequest = z.infer<typeof UpgradeRequestSchema>;

export const StandardWithMacrosSchema = z
  .object({
    recipe: StandardRecipeSchema,
    macrosPerServing: MacrosSchema,
  })
  .strict();

export const UpgradedWithMacrosSchema = z
  .object({
    recipe: UpgradedRecipeSchema,
    macrosPerServing: MacrosSchema,
  })
  .strict();

export const UpgradeResponseSchema = z
  .object({
    resolvedGoals: GoalsSchema,
    standard: StandardWithMacrosSchema,
    upgraded: UpgradedWithMacrosSchema,
    goalsMet: z.boolean(),
    /** Set when goalsMet is false, or when location/availability data was unavailable. Plain text only. */
    notes: z.string().max(1_000).optional(),
    availability: z.array(AvailabilitySchema).max(200).optional(),
  })
  .strict();

export type UpgradeResponse = z.infer<typeof UpgradeResponseSchema>;

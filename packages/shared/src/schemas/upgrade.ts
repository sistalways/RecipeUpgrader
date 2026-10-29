import { z } from "zod";
import { MAX_RECIPE_TEXT_LENGTH, ParsedRecipeSchema, UpgradedRecipeSchema } from "./recipe.js";
import { AvailabilitySchema, LocationInputSchema } from "./location.js";
import { MacrosSchema } from "./macros.js";

/**
 * Goals the rewritten recipe should hit, always expressed per serving.
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
    recipeText: z.string().trim().min(1).max(MAX_RECIPE_TEXT_LENGTH),
    goals: GoalsSchema,
    location: LocationInputSchema.optional(),
  })
  .strict();

export type UpgradeRequest = z.infer<typeof UpgradeRequestSchema>;

export const UpgradeResponseSchema = z
  .object({
    original: z
      .object({
        parsed: ParsedRecipeSchema,
        macrosPerServing: MacrosSchema,
      })
      .strict(),
    upgraded: z
      .object({
        recipe: UpgradedRecipeSchema,
        macrosPerServing: MacrosSchema,
      })
      .strict(),
    goalsMet: z.boolean(),
    /** Set when goalsMet is false, or when location/availability data was unavailable. Plain text only. */
    notes: z.string().max(1_000).optional(),
    availability: z.array(AvailabilitySchema).max(200).optional(),
  })
  .strict();

export type UpgradeResponse = z.infer<typeof UpgradeResponseSchema>;

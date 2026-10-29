import { z } from "zod";

export const MAX_INGREDIENTS = 60;
export const MAX_STEPS = 60;
export const MAX_DISH_NAME_LENGTH = 200;
export const MAX_FIELD_LENGTH = 200;

/**
 * A single ingredient line as understood by the system: a name the USDA
 * lookup can match, plus a quantity and unit for macro math.
 */
export const IngredientSchema = z
  .object({
    name: z.string().trim().min(1).max(MAX_FIELD_LENGTH),
    quantity: z.number().positive(),
    unit: z.string().trim().min(1).max(40),
    /** Optional note from the model, e.g. "boneless, skinless". Never executed, never trusted as instructions. */
    notes: z.string().trim().max(MAX_FIELD_LENGTH).optional(),
  })
  .strict();

export type Ingredient = z.infer<typeof IngredientSchema>;

/**
 * Output of the fast generation model: a standard, typical recipe for a
 * dish name, at the requested serving count. This is the "before" baseline
 * for the upgrade, not something the user supplied. It is untrusted model
 * output until it passes this schema.
 */
export const StandardRecipeSchema = z
  .object({
    title: z.string().trim().max(MAX_FIELD_LENGTH).optional(),
    servings: z.number().int().positive().max(100),
    ingredients: z.array(IngredientSchema).min(1).max(MAX_INGREDIENTS),
    steps: z.array(z.string().trim().max(2_000)).max(MAX_STEPS).optional(),
  })
  .strict();

export type StandardRecipe = z.infer<typeof StandardRecipeSchema>;

/**
 * Output of the reasoning model: the rewritten recipe. Still just data —
 * macros are recomputed in code afterward, never trusted from the model.
 */
export const UpgradedRecipeSchema = z
  .object({
    title: z.string().trim().max(MAX_FIELD_LENGTH).optional(),
    servings: z.number().int().positive().max(100),
    ingredients: z.array(IngredientSchema).min(1).max(MAX_INGREDIENTS),
    steps: z.array(z.string().trim().max(2_000)).max(MAX_STEPS).optional(),
    /** Short, human-readable explanation of what changed and why. Rendered as plain text only. */
    substitutionNotes: z.string().trim().max(2_000).optional(),
  })
  .strict();

export type UpgradedRecipe = z.infer<typeof UpgradedRecipeSchema>;

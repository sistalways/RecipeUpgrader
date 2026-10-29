import { z } from "zod";

/**
 * Macro totals for a recipe, always expressed per serving.
 * These numbers are computed in code from USDA FoodData Central data.
 * The LLM never invents nutrition numbers (see PROJECT.md section 1 and 2).
 */
export const MacrosSchema = z
  .object({
    caloriesKcal: z.number().nonnegative(),
    proteinG: z.number().nonnegative(),
    carbsG: z.number().nonnegative(),
    fatG: z.number().nonnegative(),
  })
  .strict();

export type Macros = z.infer<typeof MacrosSchema>;

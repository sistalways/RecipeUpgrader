import { z } from "zod";
import { Pagination } from "../../queries";

// =========================
// Reference DTO
// =========================
export const IngredientRef = z.object({
  id: z.number(),
  ingredientName: z.string().nullable(),
});
export type IngredientRef = z.infer<typeof IngredientRef>;

// =========================
// Output DTO
// =========================
export const IngredientOut = z.object({
  id: z.number(),
  recipeId: z.number(),
  userId: z.number(),
  ingredientName: z.string().nullable(),
  ingredientQuantity: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Optional: embed recipe reference
  recipe: z
    .object({
      id: z.number(),
      recipeName: z.string(),
    })
    .optional(),
});
export type IngredientOut = z.infer<typeof IngredientOut>;

// =========================
// Creation DTO
// =========================
export const IngredientCreateIn = z.object({
  recipeId: z.number(),
  userId: z.number(),
  ingredientName: z.string().optional(),
  ingredientQuantity: z.number(),
});
export type IngredientCreateIn = z.infer<typeof IngredientCreateIn>;

// =========================
// Update DTO
// =========================
export const IngredientUpdateIn = z.object({
  ingredientName: z.string().optional(),
  ingredientQuantity: z.number().optional(),
  recipeId: z.number().optional(),
});
export type IngredientUpdateIn = z.infer<typeof IngredientUpdateIn>;

// =========================
// Query DTO
// =========================
export const IngredientsListFilter = Pagination.extend({
  userId: z.number().optional(),
  recipeId: z.number().optional(),
  ingredientNameLike: z.string().optional(),
});
export type IngredientsListFilter = z.infer<typeof IngredientsListFilter>;

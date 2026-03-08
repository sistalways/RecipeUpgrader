import { z } from "zod";
import { Pagination } from "../../queries";

// =========================
// Reference DTO (lightweight relation embed)
// =========================
export const RecipeRef = z.object({
  id: z.number(),
  recipeName: z.string(),
});
export type RecipeRef = z.infer<typeof RecipeRef>;

// =========================
// Output DTO (API responses)
// =========================
export const RecipeOut = z.object({
  id: z.number(),
  //userId: z.number(),
  recipeName: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),

  // Optional: embed ingredients
  ingredients: z
    .array(
      z.object({
        id: z.number(),
        ingredientName: z.string().nullable(),
        ingredientQuantity: z.number(),
      })
    )
    .optional(),
});
export type RecipeOut = z.infer<typeof RecipeOut>;

// =========================
// Creation DTO (API request body)
// =========================
export const RecipeCreateIn = z.object({
  recipeName: z.string().min(1, "Recipe name is required"),
  //userId: z.number(),
});
export type RecipeCreateIn = z.infer<typeof RecipeCreateIn>;

// =========================
// Update DTO (API request body)
// =========================
export const RecipeUpdateIn = z.object({
  recipeName: z.string().min(1).optional(),
  userId: z.number().optional(),
});
export type RecipeUpdateIn = z.infer<typeof RecipeUpdateIn>;

// =========================
// Query DTO (API query parameters)
// =========================
export const RecipesListFilter = Pagination.extend({
  userId: z.number().optional(),
  recipeNameLike: z.string().optional(),
});
export type RecipesListFilter = z.infer<typeof RecipesListFilter>;

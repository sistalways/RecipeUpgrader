import {
  ListSavedRecipesResponseSchema,
  SavedRecipeSchema,
  type ListSavedRecipesResponse,
  type SaveRecipeRequest,
  type SavedRecipe,
} from "@recipeupgrader/shared";
import { apiFetch } from "./client.js";

export async function saveRecipe(accessToken: string, request: SaveRecipeRequest): Promise<SavedRecipe> {
  return apiFetch("/api/recipes", {
    method: "POST",
    body: request,
    accessToken,
    responseSchema: SavedRecipeSchema,
  });
}

export async function listSavedRecipes(accessToken: string): Promise<ListSavedRecipesResponse> {
  return apiFetch("/api/recipes", {
    method: "GET",
    accessToken,
    responseSchema: ListSavedRecipesResponseSchema,
  });
}

export async function deleteSavedRecipe(accessToken: string, id: string): Promise<void> {
  await apiFetch(`/api/recipes/${id}`, { method: "DELETE", accessToken });
}

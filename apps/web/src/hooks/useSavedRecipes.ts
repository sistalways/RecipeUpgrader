import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SaveRecipeRequest } from "@recipeupgrader/shared";
import { deleteSavedRecipe, listSavedRecipes, saveRecipe } from "../api/recipes.js";

const SAVED_RECIPES_KEY = ["savedRecipes"];

export function useSavedRecipes(accessToken: string | undefined) {
  return useQuery({
    queryKey: SAVED_RECIPES_KEY,
    queryFn: () => listSavedRecipes(accessToken as string),
    enabled: Boolean(accessToken),
  });
}

export function useSaveRecipe(accessToken: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SaveRecipeRequest) => saveRecipe(accessToken as string, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_RECIPES_KEY });
    },
  });
}

export function useDeleteSavedRecipe(accessToken: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSavedRecipe(accessToken as string, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_RECIPES_KEY });
    },
  });
}

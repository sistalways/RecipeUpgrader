import { useMutation } from "@tanstack/react-query";
import type { UpgradeRequest } from "@recipeupgrader/shared";
import { upgradeRecipe } from "../api/upgrade.js";

export function useUpgradeRecipe() {
  return useMutation({
    mutationFn: (request: UpgradeRequest) => upgradeRecipe(request),
  });
}

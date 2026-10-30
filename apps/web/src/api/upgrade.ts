import { UpgradeRequestSchema, UpgradeResponseSchema, type UpgradeRequest, type UpgradeResponse } from "@recipeupgrader/shared";
import { apiFetch } from "./client.js";

export { ApiError } from "./client.js";

/**
 * Typed client for POST /api/upgrade. The request is validated with the
 * shared schema before it's sent (fail fast, same rules as the server).
 */
export async function upgradeRecipe(request: UpgradeRequest): Promise<UpgradeResponse> {
  const validatedRequest = UpgradeRequestSchema.parse(request);

  return apiFetch("/api/upgrade", {
    method: "POST",
    body: validatedRequest,
    responseSchema: UpgradeResponseSchema,
  });
}

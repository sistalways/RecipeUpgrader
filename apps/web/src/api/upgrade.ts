import { UpgradeRequestSchema, UpgradeResponseSchema, type UpgradeRequest, type UpgradeResponse } from "@recipeupgrader/shared";
import { apiFetch } from "./client.js";

export { ApiError } from "./client.js";

/**
 * Typed client for POST /api/upgrade. The request is validated with the
 * shared schema before it's sent (fail fast, same rules as the server).
 * Requires the signed-in user's access token; the API rejects it otherwise.
 */
export async function upgradeRecipe(accessToken: string, request: UpgradeRequest): Promise<UpgradeResponse> {
  const validatedRequest = UpgradeRequestSchema.parse(request);

  return apiFetch("/api/upgrade", {
    method: "POST",
    body: validatedRequest,
    accessToken,
    responseSchema: UpgradeResponseSchema,
  });
}

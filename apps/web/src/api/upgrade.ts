import { UpgradeRequestSchema, UpgradeResponseSchema, type UpgradeRequest, type UpgradeResponse } from "@recipeupgrader/shared";
import { API_BASE_URL } from "../lib/env.js";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Typed client for POST /api/upgrade. The request is validated with the
 * shared schema before it's sent (fail fast, same rules as the server),
 * and the response is validated before anything renders — we never trust
 * an HTTP response blindly, even from our own API (PROJECT.md section
 * 6.2 / "All API calls go through apps/web/src/api/").
 */
export async function upgradeRecipe(request: UpgradeRequest): Promise<UpgradeResponse> {
  const validatedRequest = UpgradeRequestSchema.parse(request);

  const response = await fetch(`${API_BASE_URL}/api/upgrade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validatedRequest),
  });

  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    const errorBody = body as { error?: { code?: string; message?: string } } | undefined;
    throw new ApiError(
      errorBody?.error?.message ?? "Something went wrong upgrading this recipe.",
      response.status,
      errorBody?.error?.code,
    );
  }

  const parsed = UpgradeResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("The server returned an unexpected response.", response.status);
  }

  return parsed.data;
}

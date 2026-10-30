import type { ZodType } from "zod";
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

interface RequestOptions<T> {
  method: "GET" | "POST" | "DELETE";
  body?: unknown;
  accessToken?: string;
  /** Omit for responses with no body (e.g. 204 from DELETE). */
  responseSchema?: ZodType<T>;
}

/**
 * Shared fetch wrapper for every API call. Validates the response against
 * the shared schema before returning it — never trust an HTTP response
 * blindly, even from our own API (PROJECT.md section 6.2 / "All API calls
 * go through apps/web/src/api/").
 */
export async function apiFetch<T>(path: string, options: RequestOptions<T>): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.accessToken) headers.Authorization = `Bearer ${options.accessToken}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody: unknown = await response.json().catch(() => undefined);
    const parsed = errorBody as { error?: { code?: string; message?: string } } | undefined;
    throw new ApiError(
      parsed?.error?.message ?? "Something went wrong talking to the server.",
      response.status,
      parsed?.error?.code,
    );
  }

  if (!options.responseSchema) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => undefined);
  const parsed = options.responseSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError("The server returned an unexpected response.", response.status);
  }

  return parsed.data;
}

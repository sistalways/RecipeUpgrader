import { createRemoteJWKSet, jwtVerify } from "jose";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config.js";
import { AuthError } from "../lib/errors.js";

/**
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9).
 *
 * Verifies the Supabase-issued JWT on protected routes and attaches the
 * authenticated user to the request. The user ID always comes from here -
 * a verified token's "sub" claim - never from a request body field
 * (PROJECT.md section 6.4: "Never trust a user ID sent in a request
 * body"). The raw access token is also kept on the request so route
 * handlers can pass it through to a per-user Supabase client, letting
 * Postgres row-level security do the actual enforcement on data access
 * (see services/recipes/).
 */

export interface AuthenticatedUser {
  id: string;
  accessToken: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

// Supabase verifies tokens against a public key set, not a shared secret.
// Fetched lazily so a deployment without auth configured doesn't crash at
// import time; requireAuth below fails closed with a clear error instead.
const jwks = env.SUPABASE_JWKS_URL ? createRemoteJWKSet(new URL(env.SUPABASE_JWKS_URL)) : null;

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (!jwks) {
    throw new AuthError("Authentication is not configured on this server");
  }

  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new AuthError("Missing bearer token");
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    throw new AuthError("Missing bearer token");
  }

  let sub: string | undefined;
  try {
    const { payload } = await jwtVerify(token, jwks);
    sub = typeof payload.sub === "string" ? payload.sub : undefined;
  } catch {
    throw new AuthError("Invalid or expired token");
  }

  if (!sub) {
    throw new AuthError("Token is missing a subject");
  }

  request.user = { id: sub, accessToken: token };
}

/**
 * Reads the authenticated user off a request, for use inside a route
 * handler that has `requireAuth` as a preHandler. Throws rather than
 * using a non-null assertion if somehow called without it having run.
 */
export function getAuthenticatedUser(request: FastifyRequest): AuthenticatedUser {
  if (!request.user) {
    throw new AuthError("Not authenticated");
  }
  return request.user;
}

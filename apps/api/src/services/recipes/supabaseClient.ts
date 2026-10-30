import { createClient } from "@supabase/supabase-js";
import { env } from "../../config.js";
import { UpstreamError } from "../../lib/errors.js";

/**
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9).
 *
 * Creates a Supabase client scoped to one authenticated user, using the
 * public anon key plus that user's own verified access token. Postgres
 * row-level security (auth.uid() = user_id, set up on saved_recipes)
 * enforces ownership from this point on — the app code never needs its
 * own "WHERE user_id = ..." filter, and never should.
 *
 * The service-role key is never used here. Per PROJECT.md section 6.4,
 * it's reserved for the shared cache table only, never for code paths
 * that touch user-owned data — using it here would bypass RLS entirely.
 */
export function createUserScopedClient(accessToken: string) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    throw new UpstreamError("Saved recipes are not configured on this server");
  }

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

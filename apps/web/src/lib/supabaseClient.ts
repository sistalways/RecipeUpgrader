import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isAuthConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./env.js";

/**
 * Null when login isn't configured for this deployment (no Supabase env
 * vars set). Sign-in is required, so App.tsx shows a "not configured"
 * message in that case instead of crashing.
 */
export const supabase: SupabaseClient | null = isAuthConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;

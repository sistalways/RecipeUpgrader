/**
 * The frontend may only hold public values: the API base URL and the
 * Supabase URL/anon key. Never put a secret behind VITE_* — Vite ships
 * every VITE_* var to the browser (PROJECT.md section 6.1).
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const SUPABASE_URL: string | undefined = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Login/save-recipe is optional — the guest flow works with these unset. */
export const isAuthConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

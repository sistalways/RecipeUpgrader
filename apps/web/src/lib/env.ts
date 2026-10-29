/**
 * The frontend may only hold public values: the API base URL and (later)
 * the Supabase URL/anon key. Never put a secret behind VITE_* — Vite
 * ships every VITE_* var to the browser (PROJECT.md section 6.1).
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

import "dotenv/config";
import { z } from "zod";

/**
 * An env var left blank in a .env file (`FOO=`) comes through as `""`, not
 * `undefined`. Without this, `z.string().optional()` still rejects it, so
 * every not-yet-wired-in optional var in .env.example would fail startup
 * the moment someone copies the file as-is.
 */
function optionalString(schema: z.ZodString) {
  return z.preprocess((v) => (v === "" ? undefined : v), schema.optional());
}

/**
 * All server-side configuration, validated once at startup. If anything is
 * missing or malformed, the process exits immediately rather than running
 * with a broken or insecure configuration (PROJECT.md section 6.1).
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  ALLOWED_ORIGINS: z
    .string()
    .min(1)
    .default("http://localhost:5173")
    .transform((v) => v.split(",").map((s) => s.trim())),

  TOKEN_FACTORY_API_KEY: z.string().min(1),
  TOKEN_FACTORY_BASE_URL: z.string().url(),
  MODEL_FAST: z.string().min(1),
  MODEL_REASONING: z.string().min(1),

  TAVILY_API_KEY: optionalString(z.string().min(1)),
  USDA_API_KEY: z.string().min(1),
  KROGER_CLIENT_ID: optionalString(z.string().min(1)),
  KROGER_CLIENT_SECRET: optionalString(z.string().min(1)),

  SUPABASE_URL: optionalString(z.string().url()),
  SUPABASE_ANON_KEY: optionalString(z.string().min(1)),
  SUPABASE_SERVICE_ROLE_KEY: optionalString(z.string().min(1)),
  // Supabase's newer projects verify JWTs against a public key set rather
  // than a single shared secret - no secret to protect, since a JWKS URL
  // only ever exposes public keys.
  SUPABASE_JWKS_URL: optionalString(z.string().url()),
});

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    // Never log secret values; z.safeParse errors only name paths and issue codes.
    console.error("Invalid environment configuration:", result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();

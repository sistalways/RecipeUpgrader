import "dotenv/config";
import { z } from "zod";

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

  TAVILY_API_KEY: z.string().min(1).optional(),
  USDA_API_KEY: z.string().min(1),
  KROGER_CLIENT_ID: z.string().min(1).optional(),
  KROGER_CLIENT_SECRET: z.string().min(1).optional(),

  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),
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

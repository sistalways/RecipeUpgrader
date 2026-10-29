import pino from "pino";
import { env } from "../config.js";

/**
 * Structured JSON logger for use outside of a Fastify request context
 * (services, startup). Fastify's own request logs use its built-in pino
 * instance instead. Never log secrets, auth tokens, full recipe text, raw
 * prompts, precise coordinates, or emails (PROJECT.md section 4 "Logging").
 */
export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
});

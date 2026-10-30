import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyError } from "fastify";
import { env } from "./config.js";
import { AppError } from "./lib/errors.js";
import { registerHealthRoute } from "./routes/health.js";
import { registerRecipesRoute } from "./routes/recipes.js";
import { registerUpgradeRoute } from "./routes/upgrade.js";

/**
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9 — this file
 * wires up CORS, rate limiting, and the global error handler).
 */
export async function buildServer() {
  const app = Fastify({
    logger: true,
    bodyLimit: 64 * 1024, // 64 KB, per PROJECT.md section 6.2
  });

  await app.register(helmet);
  await app.register(cors, {
    origin: env.ALLOWED_ORIGINS,
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "10 minutes",
    // By IP for everyone, guest or signed in — PROJECT.md section 6.5.
    // There's no separate per-user tier; the saved-recipes routes aren't
    // expensive enough (no LLM calls) to need one.
  });

  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } });
      return;
    }

    // fastify/rate-limit throws a plain error with statusCode 429.
    if (error.statusCode === 429) {
      reply.status(429).send({ error: { code: "RATE_LIMIT_ERROR", message: "Too many requests" } });
      return;
    }

    request.log.error(error);
    reply.status(500).send({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
  });

  registerHealthRoute(app);
  registerUpgradeRoute(app);
  registerRecipesRoute(app);

  return app;
}

async function main() {
  const app = await buildServer();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
}

// Only start listening when this file is run directly (e.g. `tsx src/server.ts`),
// not when buildServer() is imported by tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

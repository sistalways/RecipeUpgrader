import type { z } from "zod";
import { tokenFactoryClient } from "./client.js";
import { UpstreamError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";

interface CallModelParams<T> {
  /** Short label for logs, e.g. "generateBaseRecipe" or "rewriteRecipe". Never the prompt itself. */
  task: string;
  /** Model ID, always from env (config.ts), never hardcoded. */
  model: string;
  /** Instructions only. Untrusted content must not be placed here. */
  system: string;
  /** User-turn content. Untrusted content goes here, already sanitized and delimiter-wrapped by the caller. */
  user: string;
  schema: z.ZodType<T>;
  timeoutMs?: number;
}

function extractJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    // Some models wrap JSON in prose or markdown fences despite instructions.
    // Try to recover the first top-level JSON object before giving up.
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Model response was not valid JSON");
  }
}

/**
 * The single entry point for every Token Factory call: enforces a timeout,
 * parses the response as JSON, validates it with the caller's Zod schema,
 * retries once (with the validation error summarized back to the model) on
 * failure, and logs latency/tokens/outcome without ever logging prompt or
 * recipe content (PROJECT.md section 2 step 3/6 and section 4 "Logging").
 *
 * Throws UpstreamError if the model call fails outright or is still invalid
 * after one retry. Callers never see raw upstream errors or model output
 * that failed validation.
 */
export async function callModel<T>(params: CallModelParams<T>): Promise<T> {
  const { task, model, system, user, schema, timeoutMs = 60_000 } = params;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  let lastError: string | undefined;

  for (let attempt = 0; attempt <= 1; attempt++) {
    const startedAt = Date.now();
    try {
      const completion = await tokenFactoryClient.chat.completions.create(
        {
          model,
          messages,
          response_format: { type: "json_object" },
          temperature: 0.2,
        },
        { timeout: timeoutMs },
      );

      const latencyMs = Date.now() - startedAt;
      const content = completion.choices[0]?.message.content ?? "";
      const parsedJson = extractJson(content);
      const result = schema.safeParse(parsedJson);

      if (result.success) {
        logger.info({
          task,
          model,
          latencyMs,
          attempt,
          usage: completion.usage,
          outcome: "ok",
        });
        return result.data;
      }

      lastError = result.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ");

      logger.warn({ task, model, latencyMs, attempt, outcome: "validation_failed" });

      messages.push(
        { role: "assistant", content },
        {
          role: "user",
          content: `Your last response did not match the required JSON schema: ${lastError}. Respond again with corrected JSON only, no prose.`,
        },
      );
    } catch (err) {
      const latencyMs = Date.now() - startedAt;
      logger.error({ task, model, latencyMs, attempt, outcome: "upstream_error" });
      if (attempt === 1) {
        throw new UpstreamError(`${task}: model call failed`);
      }
      lastError = err instanceof Error ? err.message : "unknown error";
    }
  }

  throw new UpstreamError(`${task}: model output failed validation after retry (${lastError})`);
}

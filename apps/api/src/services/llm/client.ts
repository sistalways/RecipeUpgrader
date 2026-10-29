import OpenAI from "openai";
import { env } from "../../config.js";

/**
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9).
 *
 * Single Token Factory client for the whole app. Only this module (and
 * callModel.ts, which wraps it) may talk to Token Factory — PROJECT.md
 * section 3 and section 9 ("Never add another LLM provider, hardcode a
 * model ID, or call Token Factory outside services/llm/"). Model IDs come
 * from env vars only, never hardcoded (see config.ts).
 */
export const tokenFactoryClient = new OpenAI({
  apiKey: env.TOKEN_FACTORY_API_KEY,
  baseURL: env.TOKEN_FACTORY_BASE_URL,
});

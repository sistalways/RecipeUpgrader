import { z } from "zod";
import { AvailabilitySchema, MAX_TAVILY_QUERIES, type Availability, type Store } from "@recipeupgrader/shared";
import { env } from "../../config.js";
import { TtlCache } from "../cache/ttlCache.js";

const TAVILY_URL = "https://api.tavily.com/search";
const TAVILY_TIMEOUT_MS = 10_000;
const AVAILABILITY_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // PROJECT.md section 6.5: cache 24h

/**
 * A fixed, curated list rather than model-generated substitutes: we check
 * availability for these before the rewrite step runs, so the reasoning
 * model can prefer from what's confirmed nearby (PROJECT.md section 1,
 * step 6) - there's no recipe-specific substitute list yet at this point
 * in the pipeline, since the model hasn't rewritten anything.
 */
const CANDIDATE_SUBSTITUTES = [
  "nonfat Greek yogurt",
  "reduced-fat cream cheese",
  "egg whites",
  "whey protein powder",
  "low-fat cottage cheese",
  "turkey bacon",
  "lean ground turkey",
  "light butter",
] as const;

const TavilyResponseSchema = z.object({
  answer: z.string().optional(),
});

export function looksAvailable(answer: string): boolean {
  const normalized = answer.trim().toLowerCase();
  if (/^(yes|definitely|likely)/.test(normalized)) {
    return true;
  }
  if (/^(no|not likely|unlikely)/.test(normalized)) {
    return false;
  }
  const positive = /\bsells?\b|\bavailable\b|\bcarries\b|\bin stock\b/.test(normalized);
  const negative = /\bdoesn'?t\b|\bdon'?t\b|\bnot available\b|\bout of stock\b|\bdiscontinued\b/.test(
    normalized,
  );
  return positive && !negative;
}

export function extractPriceUsd(text: string): number | undefined {
  const match = /\$(\d+(?:\.\d{1,2})?)/.exec(text);
  return match ? Number(match[1]) : undefined;
}

async function queryTavily(query: string): Promise<string | undefined> {
  const response = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: env.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      include_answer: true,
      max_results: 3,
    }),
    signal: AbortSignal.timeout(TAVILY_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`Tavily returned ${response.status}`);
  }

  const body: unknown = await response.json();
  const parsed = TavilyResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Tavily response was malformed");
  }
  return parsed.data.answer;
}

// Keyed by store + ingredient only, never a user ID (PROJECT.md section 6.7).
const availabilityCache = new TtlCache<Availability | null>(AVAILABILITY_CACHE_TTL_MS);

/**
 * SECURITY-SENSITIVE: review by hand (PROJECT.md section 9).
 *
 * Checks whether each candidate substitute ingredient is sold at the given
 * store, via Tavily's web search. Tavily's raw answer text is untrusted
 * web content (PROJECT.md section 6.3) and never leaves this function -
 * only the condensed { ingredient, store, available, priceUsd? } fact
 * does, which is all that ever reaches the rewrite prompt.
 *
 * Capped at MAX_TAVILY_QUERIES per call (PROJECT.md section 6.5). If
 * Tavily isn't configured, or any single lookup fails, that ingredient is
 * just left out - availability data is optional, and its absence is
 * never an error.
 */
export async function checkAvailability(store: Store): Promise<Availability[]> {
  if (!env.TAVILY_API_KEY) {
    return [];
  }

  const candidates = CANDIDATE_SUBSTITUTES.slice(0, MAX_TAVILY_QUERIES);

  const results = await Promise.all(
    candidates.map(async (ingredient): Promise<Availability | null> => {
      const cacheKey = `${store.name}::${ingredient}`;
      const cached = availabilityCache.get(cacheKey);
      if (cached !== undefined) {
        return cached;
      }

      let result: Availability | null;
      try {
        const answer = await queryTavily(`Does ${store.name} sell ${ingredient}?`);
        result = answer
          ? AvailabilitySchema.parse({
              ingredient,
              store: store.name,
              available: looksAvailable(answer),
              priceUsd: extractPriceUsd(answer),
            })
          : null;
      } catch {
        result = null;
      }

      availabilityCache.set(cacheKey, result);
      return result;
    }),
  );

  return results.filter((result): result is Availability => result !== null);
}

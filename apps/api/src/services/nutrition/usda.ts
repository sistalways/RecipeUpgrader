import { z } from "zod";
import type { Macros } from "@recipeupgrader/shared";
import { env } from "../../config.js";
import { UpstreamError } from "../../lib/errors.js";

const USDA_TIMEOUT_MS = 10_000;
const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

// USDA FoodData Central nutrient IDs for the four macros we track.
const NUTRIENT_IDS = {
  caloriesKcal: 1008,
  proteinG: 1003,
  carbsG: 1005,
  fatG: 1004,
} as const;

const UsdaFoodNutrientSchema = z.object({
  nutrientId: z.number(),
  nutrientName: z.string().optional(),
  unitName: z.string().optional(),
  value: z.number().optional(),
});

const UsdaFoodSchema = z.object({
  fdcId: z.number(),
  description: z.string(),
  dataType: z.string().optional(),
  foodNutrients: z.array(UsdaFoodNutrientSchema).default([]),
});

const UsdaSearchResponseSchema = z.object({
  foods: z.array(UsdaFoodSchema).default([]),
});

/** Macros per 100g for a matched USDA food. */
export interface UsdaFoodMatch {
  fdcId: number;
  description: string;
  macrosPer100g: Macros;
}

// Simple in-memory cache for the lifetime of the process. USDA data rarely
// changes, so this is a reasonable stand-in today; PROJECT.md section 3
// calls for a Supabase-backed cache with TTL, planned for tomorrow.
const searchCache = new Map<string, UsdaFoodMatch | null>();

function extractMacrosPer100g(food: z.infer<typeof UsdaFoodSchema>): Macros {
  const byId = new Map(food.foodNutrients.map((n) => [n.nutrientId, n.value ?? 0]));
  return {
    caloriesKcal: byId.get(NUTRIENT_IDS.caloriesKcal) ?? 0,
    proteinG: byId.get(NUTRIENT_IDS.proteinG) ?? 0,
    carbsG: byId.get(NUTRIENT_IDS.carbsG) ?? 0,
    fatG: byId.get(NUTRIENT_IDS.fatG) ?? 0,
  };
}

/**
 * Looks up the best USDA match for an ingredient name and returns its
 * macros per 100g. Returns null if nothing matched (caller decides how to
 * degrade — see computeMacros.ts). Cached in-memory per process.
 */
export async function searchUsdaFood(name: string): Promise<UsdaFoodMatch | null> {
  const cacheKey = name.trim().toLowerCase();
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey) ?? null;
  }

  const url = new URL(USDA_SEARCH_URL);
  url.searchParams.set("api_key", env.USDA_API_KEY);
  url.searchParams.set("query", name);
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("dataType", "Foundation,SR Legacy");

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(USDA_TIMEOUT_MS) });
  } catch {
    throw new UpstreamError("USDA lookup failed");
  }

  if (!response.ok) {
    throw new UpstreamError("USDA lookup failed");
  }

  const body: unknown = await response.json();
  const parsed = UsdaSearchResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new UpstreamError("USDA response was malformed");
  }

  const bestMatch = parsed.data.foods[0];
  const match: UsdaFoodMatch | null = bestMatch
    ? {
        fdcId: bestMatch.fdcId,
        description: bestMatch.description,
        macrosPer100g: extractMacrosPer100g(bestMatch),
      }
    : null;

  searchCache.set(cacheKey, match);
  return match;
}

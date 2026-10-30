import { z } from "zod";
import { StoreSchema, type Store } from "@recipeupgrader/shared";
import { UpstreamError } from "../../lib/errors.js";
import { TtlCache } from "../cache/ttlCache.js";
import { haversineDistanceKm } from "./distance.js";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_TIMEOUT_MS = 10_000;
const SEARCH_RADIUS_METERS = 5_000;
const MAX_STORES = 5;
const STORE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // store locations don't move; cache a week

const OverpassElementSchema = z.object({
  id: z.number(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  center: z.object({ lat: z.number(), lon: z.number() }).optional(),
  tags: z.record(z.string(), z.string()).optional(),
});

const OverpassResponseSchema = z.object({
  elements: z.array(OverpassElementSchema).default([]),
});

// Keyed by rounded coordinates only, never a user ID (PROJECT.md section 6.7).
const storeCache = new TtlCache<Store[]>(STORE_CACHE_TTL_MS);

/**
 * Finds grocery stores near the given coordinates (expected already
 * rounded to ~1km) via OpenStreetMap's Overpass API. No API key needed.
 */
export async function findNearbyStores(lat: number, lon: number): Promise<Store[]> {
  const cacheKey = `${lat},${lon}`;
  const cached = storeCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const query = `[out:json][timeout:10];(node["shop"="supermarket"](around:${SEARCH_RADIUS_METERS},${lat},${lon});node["shop"="grocery"](around:${SEARCH_RADIUS_METERS},${lat},${lon}););out center ${MAX_STORES * 3};`;

  let response: Response;
  try {
    response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
      signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
    });
  } catch {
    throw new UpstreamError("Nearby store lookup failed");
  }

  if (!response.ok) {
    throw new UpstreamError("Nearby store lookup failed");
  }

  const body: unknown = await response.json();
  const parsed = OverpassResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new UpstreamError("Nearby store response was malformed");
  }

  const stores = parsed.data.elements
    .map((element) => {
      const name = element.tags?.name;
      const storeLat = element.lat ?? element.center?.lat;
      const storeLon = element.lon ?? element.center?.lon;
      if (!name || storeLat === undefined || storeLon === undefined) {
        return null;
      }
      const address = [element.tags?.["addr:housenumber"], element.tags?.["addr:street"]]
        .filter(Boolean)
        .join(" ");
      return StoreSchema.parse({
        id: String(element.id),
        name,
        lat: storeLat,
        lon: storeLon,
        address: address || undefined,
      });
    })
    .filter((store): store is Store => store !== null)
    .sort(
      (a, b) =>
        haversineDistanceKm(lat, lon, a.lat, a.lon) - haversineDistanceKm(lat, lon, b.lat, b.lon),
    )
    .slice(0, MAX_STORES);

  storeCache.set(cacheKey, stores);
  return stores;
}

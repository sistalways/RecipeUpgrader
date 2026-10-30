import { z } from "zod";
import { UpstreamError } from "../../lib/errors.js";

const ZIPPOPOTAM_TIMEOUT_MS = 10_000;

const ZippopotamResponseSchema = z.object({
  places: z
    .array(
      z.object({
        latitude: z.string(),
        longitude: z.string(),
      }),
    )
    .min(1),
});

export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Converts a US ZIP code to coordinates via Zippopotam (free, no API key).
 * Rounded to ~1km (2 decimal places) immediately - a precise address is
 * never derived or stored (PROJECT.md section 6.7).
 */
export async function geocodeZip(zip: string): Promise<{ lat: number; lon: number }> {
  let response: Response;
  try {
    response = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      signal: AbortSignal.timeout(ZIPPOPOTAM_TIMEOUT_MS),
    });
  } catch {
    throw new UpstreamError("ZIP code lookup failed");
  }

  if (!response.ok) {
    throw new UpstreamError("ZIP code lookup failed");
  }

  const body: unknown = await response.json();
  const parsed = ZippopotamResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new UpstreamError("ZIP code response was malformed");
  }

  const place = parsed.data.places[0];
  if (!place) {
    throw new UpstreamError("ZIP code response was malformed");
  }

  return {
    lat: roundCoordinate(Number(place.latitude)),
    lon: roundCoordinate(Number(place.longitude)),
  };
}

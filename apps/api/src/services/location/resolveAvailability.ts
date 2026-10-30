import type { Availability, LocationInput } from "@recipeupgrader/shared";
import { checkAvailability } from "./checkAvailability.js";
import { findNearbyStores } from "./findNearbyStores.js";
import { geocodeZip, roundCoordinate } from "./geocode.js";

/**
 * Resolves a user's location (ZIP or coordinates) into a list of
 * ingredient-availability facts at the nearest grocery store. Every step
 * here can fail independently (bad ZIP, no stores nearby, Tavily down or
 * not configured) - all of that degrades to an empty list, never an
 * error. "Location failure or absence is never an error" (PROJECT.md
 * section 2): the caller always gets a normal rewrite either way.
 */
export async function resolveAvailability(location: LocationInput): Promise<Availability[]> {
  try {
    const { lat, lon } = location.zip
      ? await geocodeZip(location.zip)
      : { lat: roundCoordinate(location.lat as number), lon: roundCoordinate(location.lon as number) };

    const stores = await findNearbyStores(lat, lon);
    const nearestStore = stores[0];
    if (!nearestStore) {
      return [];
    }

    return await checkAvailability(nearestStore);
  } catch {
    return [];
  }
}

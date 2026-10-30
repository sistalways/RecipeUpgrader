import type { Availability, LocationInput, Store } from "@recipeupgrader/shared";
import { checkAvailability } from "./checkAvailability.js";
import { findNearbyStores } from "./findNearbyStores.js";
import { geocodeZip, roundCoordinate } from "./geocode.js";

export interface LocationResolution {
  /** Nearby stores, nearest first - shown to the user with directions, independent of whether Tavily found anything. */
  stores: Store[];
  availability: Availability[];
}

const EMPTY_RESOLUTION: LocationResolution = { stores: [], availability: [] };

/**
 * Resolves a user's location (ZIP or coordinates) into nearby grocery
 * stores and a list of ingredient-availability facts at the nearest one.
 * Every step here can fail independently (bad ZIP, no stores nearby,
 * Tavily down or not configured) - all of that degrades to an empty
 * result, never an error. "Location failure or absence is never an
 * error" (PROJECT.md section 2): the caller always gets a normal rewrite
 * either way.
 */
export async function resolveAvailability(location: LocationInput): Promise<LocationResolution> {
  try {
    const { lat, lon } = location.zip
      ? await geocodeZip(location.zip)
      : { lat: roundCoordinate(location.lat as number), lon: roundCoordinate(location.lon as number) };

    const stores = await findNearbyStores(lat, lon);
    const nearestStore = stores[0];
    if (!nearestStore) {
      return EMPTY_RESOLUTION;
    }

    const availability = await checkAvailability(nearestStore);
    return { stores, availability };
  } catch {
    return EMPTY_RESOLUTION;
  }
}

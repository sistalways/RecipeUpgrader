import type { Store } from "@recipeupgrader/shared";

/** Opens turn-by-turn directions to the store's coordinates - no API key needed, works for anyone with the app or a browser. */
export function googleMapsDirectionsUrl(store: Store): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}`;
}

export function appleMapsDirectionsUrl(store: Store): string {
  return `https://maps.apple.com/?daddr=${store.lat},${store.lon}&dirflg=d&q=${encodeURIComponent(store.name)}`;
}

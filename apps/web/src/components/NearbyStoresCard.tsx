import type { Availability, Store } from "@recipeupgrader/shared";
import { appleMapsDirectionsUrl, googleMapsDirectionsUrl } from "../lib/mapsLinks.js";

function MapLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-700 transition-colors hover:border-emerald-500 hover:text-emerald-700"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M10 2a6 6 0 0 0-6 6c0 4.2 6 10 6 10s6-5.8 6-10a6 6 0 0 0-6-6Zm0 8.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      </svg>
      {label}
    </a>
  );
}

export function NearbyStoresCard({
  stores,
  availability,
}: {
  stores: Store[];
  availability?: Availability[];
}) {
  const availableByStore = new Map<string, Availability[]>();
  for (const item of availability ?? []) {
    if (!item.available) continue;
    const list = availableByStore.get(item.store) ?? [];
    list.push(item);
    availableByStore.set(item.store, list);
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-bold text-stone-900">Nearby grocery stores</h3>
      <ul className="flex flex-col gap-3">
        {stores.map((store) => {
          const confirmed = availableByStore.get(store.name);
          return (
            <li
              key={store.id}
              className="flex flex-col gap-2 rounded-lg border border-stone-100 bg-stone-50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-stone-900">{store.name}</p>
                {store.address && <p className="text-xs text-stone-500">{store.address}</p>}
                {confirmed && confirmed.length > 0 && (
                  <p className="mt-1 text-xs text-emerald-700">
                    Confirmed: {confirmed.map((c) => c.ingredient).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex flex-none items-center gap-2">
                <MapLink href={googleMapsDirectionsUrl(store)} label="Google Maps" />
                <MapLink href={appleMapsDirectionsUrl(store)} label="Apple Maps" />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { describe, expect, it, vi } from "vitest";

vi.mock("../src/services/location/geocode.js", () => ({
  geocodeZip: vi.fn(async () => {
    throw new Error("ZIP service down");
  }),
  roundCoordinate: (value: number) => Math.round(value * 100) / 100,
}));

const testStore = { id: "1", name: "Test Grocery", lat: 40.71, lon: -74.0 };

const findNearbyStores = vi.fn(async () => []);
vi.mock("../src/services/location/findNearbyStores.js", () => ({
  findNearbyStores: (...args: unknown[]) => findNearbyStores(...args),
}));

const checkAvailability = vi.fn(async () => {
  throw new Error("should never be called when there are no stores");
});
vi.mock("../src/services/location/checkAvailability.js", () => ({
  checkAvailability: (...args: unknown[]) => checkAvailability(...args),
}));

const { resolveAvailability } = await import("../src/services/location/resolveAvailability.js");

describe("resolveAvailability", () => {
  it("degrades to empty stores/availability, never an error, when geocoding fails", async () => {
    await expect(resolveAvailability({ zip: "00000" })).resolves.toEqual({
      stores: [],
      availability: [],
    });
  });

  it("degrades to empty stores/availability when no stores are found nearby", async () => {
    await expect(resolveAvailability({ lat: 40.71, lon: -74.0 })).resolves.toEqual({
      stores: [],
      availability: [],
    });
  });

  it("returns both the nearby stores and the availability at the nearest one", async () => {
    findNearbyStores.mockResolvedValueOnce([testStore]);
    checkAvailability.mockResolvedValueOnce([
      { ingredient: "egg whites", store: "Test Grocery", available: true },
    ]);

    await expect(resolveAvailability({ lat: 41.0, lon: -75.0 })).resolves.toEqual({
      stores: [testStore],
      availability: [{ ingredient: "egg whites", store: "Test Grocery", available: true }],
    });
  });
});

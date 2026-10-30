import { describe, expect, it, vi } from "vitest";

vi.mock("../src/services/location/geocode.js", () => ({
  geocodeZip: vi.fn(async () => {
    throw new Error("ZIP service down");
  }),
  roundCoordinate: (value: number) => Math.round(value * 100) / 100,
}));

vi.mock("../src/services/location/findNearbyStores.js", () => ({
  findNearbyStores: vi.fn(async () => []),
}));

vi.mock("../src/services/location/checkAvailability.js", () => ({
  checkAvailability: vi.fn(async () => {
    throw new Error("should never be called when there are no stores");
  }),
}));

const { resolveAvailability } = await import("../src/services/location/resolveAvailability.js");

describe("resolveAvailability", () => {
  it("degrades to an empty list, never an error, when geocoding fails", async () => {
    await expect(resolveAvailability({ zip: "00000" })).resolves.toEqual([]);
  });

  it("degrades to an empty list when no stores are found nearby", async () => {
    await expect(resolveAvailability({ lat: 40.71, lon: -74.0 })).resolves.toEqual([]);
  });
});

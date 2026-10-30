import { describe, expect, it } from "vitest";
import { haversineDistanceKm } from "../src/services/location/distance.js";

describe("haversineDistanceKm", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistanceKm(40.71, -74.0, 40.71, -74.0)).toBeCloseTo(0, 5);
  });

  it("returns a sensible distance between two known cities", () => {
    // New York City to Los Angeles is roughly 3,935 km.
    const distance = haversineDistanceKm(40.71, -74.0, 34.05, -118.24);
    expect(distance).toBeGreaterThan(3800);
    expect(distance).toBeLessThan(4100);
  });

  it("is symmetric", () => {
    const a = haversineDistanceKm(40.71, -74.0, 34.05, -118.24);
    const b = haversineDistanceKm(34.05, -118.24, 40.71, -74.0);
    expect(a).toBeCloseTo(b, 10);
  });
});

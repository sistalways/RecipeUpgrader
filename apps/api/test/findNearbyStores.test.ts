import { afterEach, describe, expect, it, vi } from "vitest";
import { findNearbyStores } from "../src/services/location/findNearbyStores.js";

function overpassResponse(elements: unknown[]) {
  return new Response(JSON.stringify({ elements }), { status: 200 });
}

describe("findNearbyStores", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses, sorts by distance, and caps the result list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        overpassResponse([
          { id: 1, lat: 41.05, lon: -74.9, tags: { name: "Far Market" } },
          { id: 2, lat: 41.001, lon: -75.001, tags: { name: "Close Market" } },
          { id: 3, tags: { name: "Missing coordinates, should be dropped" } },
        ]),
      ),
    );

    const stores = await findNearbyStores(41.0, -75.0);

    expect(stores.map((s) => s.name)).toEqual(["Close Market", "Far Market"]);
  });

  it("supports Overpass's center field for way/relation results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        overpassResponse([{ id: 1, center: { lat: 42.0, lon: -76.0 }, tags: { name: "Center Market" } }]),
      ),
    );

    const stores = await findNearbyStores(42.0, -76.0);

    expect(stores).toHaveLength(1);
    expect(stores[0]?.name).toBe("Center Market");
  });

  it("fails with UpstreamError, never a raw error, when Overpass is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(findNearbyStores(43.0, -77.0)).rejects.toMatchObject({ code: "UPSTREAM_ERROR" });
  });
});

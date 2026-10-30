import { afterEach, describe, expect, it, vi } from "vitest";
import { geocodeZip, roundCoordinate } from "../src/services/location/geocode.js";

describe("roundCoordinate", () => {
  it("rounds to 2 decimal places (~1km precision)", () => {
    expect(roundCoordinate(40.712776)).toBe(40.71);
    expect(roundCoordinate(-74.005974)).toBe(-74.01);
  });
});

describe("geocodeZip", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns rounded coordinates from a valid response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ places: [{ latitude: "40.712776", longitude: "-74.005974" }] }),
          { status: 200 },
        ),
      ),
    );

    const result = await geocodeZip("10001");
    expect(result).toEqual({ lat: 40.71, lon: -74.01 });
  });

  it("fails with UpstreamError, never a raw error, on a bad response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not found", { status: 404 })));

    await expect(geocodeZip("00000")).rejects.toMatchObject({ code: "UPSTREAM_ERROR" });
  });
});

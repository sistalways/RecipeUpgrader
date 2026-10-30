import { afterEach, describe, expect, it, vi } from "vitest";
import { searchUsdaFood } from "../src/services/nutrition/usda.js";

const VALID_RESPONSE_BODY = {
  foods: [
    {
      fdcId: 1,
      description: "Chicken breast",
      foodNutrients: [
        { nutrientId: 1008, value: 165 },
        { nutrientId: 1003, value: 31 },
        { nutrientId: 1005, value: 0 },
        { nutrientId: 1004, value: 3.6 },
      ],
    },
  ],
};

function okResponse() {
  return new Response(JSON.stringify(VALID_RESPONSE_BODY), { status: 200 });
}

describe("searchUsdaFood retry behavior", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("succeeds on the first try without needing a retry", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    const match = await searchUsdaFood(`chicken breast ${Date.now()}`);

    expect(match?.macrosPer100g.proteinG).toBe(31);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once after a failed request and succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network blip"))
      .mockResolvedValueOnce(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    const match = await searchUsdaFood(`chicken breast retry ${Date.now()}`);

    expect(match?.macrosPer100g.proteinG).toBe(31);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("fails with UpstreamError after two consecutive failures, never a raw error", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network down"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchUsdaFood(`chicken breast fail ${Date.now()}`)).rejects.toMatchObject({
      code: "UPSTREAM_ERROR",
      statusCode: 502,
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("treats a non-OK HTTP status as a failure worth retrying", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(okResponse());
    vi.stubGlobal("fetch", fetchMock);

    const match = await searchUsdaFood(`chicken breast 429 ${Date.now()}`);

    expect(match?.macrosPer100g.proteinG).toBe(31);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

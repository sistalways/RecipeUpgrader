import { describe, expect, it } from "vitest";
import { toGrams } from "../src/services/nutrition/unitConversion.js";

describe("toGrams", () => {
  it("converts mass units exactly", () => {
    expect(toGrams(2, "g")).toBe(2);
    expect(toGrams(1, "kg")).toBe(1000);
    expect(toGrams(0.5, "kg")).toBe(500);
  });

  it("converts volume units using the water-density approximation", () => {
    expect(toGrams(250, "ml")).toBe(250);
    expect(toGrams(1, "l")).toBe(1000);
  });
});

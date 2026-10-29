import { describe, expect, it } from "vitest";
import { DEFAULT_COUNT_UNIT_GRAMS, toGrams } from "../src/services/nutrition/unitConversion.js";

describe("toGrams", () => {
  it("converts known weight units", () => {
    expect(toGrams(2, "g")).toBe(2);
    expect(toGrams(1, "kg")).toBe(1000);
    expect(toGrams(1, "oz")).toBeCloseTo(28.3495);
    expect(toGrams(1, "lb")).toBeCloseTo(453.592);
  });

  it("converts known volume units using the water-density approximation", () => {
    expect(toGrams(1, "cup")).toBeCloseTo(236.588);
    expect(toGrams(2, "tbsp")).toBeCloseTo(29.574);
  });

  it("is case-insensitive and trims whitespace", () => {
    expect(toGrams(1, " KG ")).toBe(1000);
  });

  it("falls back to a flat average for unrecognized count units", () => {
    expect(toGrams(3, "whole")).toBe(3 * DEFAULT_COUNT_UNIT_GRAMS);
    expect(toGrams(1, "clove")).toBe(DEFAULT_COUNT_UNIT_GRAMS);
  });
});

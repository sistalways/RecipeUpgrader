import { describe, expect, it } from "vitest";
import {
  GoalsSchema,
  LocationInputSchema,
  MAX_DISH_NAME_LENGTH,
  UpgradeRequestSchema,
} from "@recipeupgrader/shared";

describe("UpgradeRequestSchema", () => {
  const validBody = {
    dishName: "cheesecake",
    goalMode: "cutting" as const,
    servings: 2,
  };

  it("accepts a well-formed request", () => {
    expect(UpgradeRequestSchema.safeParse(validBody).success).toBe(true);
  });

  it("rejects unknown top-level keys (.strict())", () => {
    const result = UpgradeRequestSchema.safeParse({ ...validBody, extra: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty dish name", () => {
    const result = UpgradeRequestSchema.safeParse({ ...validBody, dishName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a dish name over the max length", () => {
    const result = UpgradeRequestSchema.safeParse({
      ...validBody,
      dishName: "a".repeat(MAX_DISH_NAME_LENGTH + 1),
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unrecognized goal mode", () => {
    const result = UpgradeRequestSchema.safeParse({ ...validBody, goalMode: "shredding" });
    expect(result.success).toBe(false);
  });
});

describe("GoalsSchema", () => {
  it("rejects calories outside the 100-5000 range", () => {
    expect(GoalsSchema.safeParse({ caloriesPerServing: 99, minProteinPerServingG: 10, servings: 1 }).success).toBe(false);
    expect(GoalsSchema.safeParse({ caloriesPerServing: 5001, minProteinPerServingG: 10, servings: 1 }).success).toBe(false);
  });

  it("accepts the boundary values", () => {
    expect(GoalsSchema.safeParse({ caloriesPerServing: 100, minProteinPerServingG: 0, servings: 1 }).success).toBe(true);
    expect(GoalsSchema.safeParse({ caloriesPerServing: 5000, minProteinPerServingG: 500, servings: 100 }).success).toBe(true);
  });
});

describe("LocationInputSchema", () => {
  it("accepts a valid 5-digit zip", () => {
    expect(LocationInputSchema.safeParse({ zip: "94103" }).success).toBe(true);
  });

  it("rejects a malformed zip", () => {
    expect(LocationInputSchema.safeParse({ zip: "941" }).success).toBe(false);
    expect(LocationInputSchema.safeParse({ zip: "abcde" }).success).toBe(false);
  });

  it("accepts valid coordinates", () => {
    expect(LocationInputSchema.safeParse({ lat: 37.77, lon: -122.42 }).success).toBe(true);
  });

  it("rejects out-of-range coordinates", () => {
    expect(LocationInputSchema.safeParse({ lat: 91, lon: 0 }).success).toBe(false);
    expect(LocationInputSchema.safeParse({ lat: 0, lon: -181 }).success).toBe(false);
  });

  it("rejects an object with neither zip nor full coordinates", () => {
    expect(LocationInputSchema.safeParse({}).success).toBe(false);
    expect(LocationInputSchema.safeParse({ lat: 1 }).success).toBe(false);
  });
});

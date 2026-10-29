import { afterEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";

vi.mock("../src/services/recipe/generateBaseRecipe.js", () => ({
  generateBaseRecipe: vi.fn(async () => ({
    title: "Chicken and rice",
    servings: 2,
    ingredients: [
      { name: "chicken breast", quantity: 200, unit: "g" },
      { name: "rice", quantity: 1, unit: "cup" },
    ],
  })),
}));

vi.mock("../src/services/recipe/rewriteRecipe.js", () => ({
  rewriteRecipe: vi.fn(async () => ({
    title: "Lean chicken and rice",
    servings: 2,
    ingredients: [
      { name: "chicken breast", quantity: 300, unit: "g" },
      { name: "rice", quantity: 0.5, unit: "cup" },
    ],
    substitutionNotes: "More chicken, less rice, to hit the protein target.",
  })),
}));

vi.mock("../src/services/nutrition/computeMacros.js", () => ({
  computeMacros: vi.fn(async () => ({
    macrosPerServing: { caloriesKcal: 450, proteinG: 40, carbsG: 30, fatG: 10 },
    unmatchedIngredients: [],
  })),
}));

// Imported after the mocks above so the route picks up the mocked modules.
const { buildServer } = await import("../src/server.js");

describe("POST /api/upgrade", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app?.close();
  });

  it("runs the full pipeline and returns validated standard/upgraded macros", async () => {
    app = await buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/upgrade",
      payload: { dishName: "chicken and rice bowl", goalMode: "bulking", servings: 2 },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.standard.recipe.title).toBe("Chicken and rice");
    expect(body.upgraded.recipe.title).toBe("Lean chicken and rice");
    expect(body.upgraded.macrosPerServing.proteinG).toBe(40);
    expect(body.resolvedGoals.minProteinPerServingG).toBeGreaterThan(0);
    expect(body.goalsMet).toBe(true);
  });

  it("rejects a malformed request body with 400 and never reaches the services", async () => {
    app = await buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/upgrade",
      payload: { dishName: "", goalMode: "bulking", servings: 2 },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects an unknown extra field (.strict())", async () => {
    app = await buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/upgrade",
      payload: { dishName: "chicken", goalMode: "bulking", servings: 2, notAllowed: true },
    });

    expect(response.statusCode).toBe(400);
  });

  it("rejects an unrecognized goal mode", async () => {
    app = await buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/upgrade",
      payload: { dishName: "chicken", goalMode: "shredding", servings: 2 },
    });

    expect(response.statusCode).toBe(400);
  });
});

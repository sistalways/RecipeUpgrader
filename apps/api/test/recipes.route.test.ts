import { afterEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";

const jwtVerify = vi.fn();

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(() => "mock-key-set"),
  jwtVerify: (...args: unknown[]) => jwtVerify(...args),
}));

const savedRecipeFixture = {
  id: "11111111-1111-4111-8111-111111111111",
  dishName: "cheesecake",
  goalMode: "cutting",
  servings: 4,
  resolvedGoals: { caloriesPerServing: 350, minProteinPerServingG: 25, servings: 4 },
  standard: {
    recipe: { servings: 4, ingredients: [{ name: "cream cheese", quantity: 450, unit: "g" }] },
    macrosPerServing: { caloriesKcal: 800, proteinG: 14, carbsG: 82, fatG: 61 },
  },
  upgraded: {
    recipe: { servings: 4, ingredients: [{ name: "reduced-fat cream cheese", quantity: 450, unit: "g" }] },
    macrosPerServing: { caloriesKcal: 390, proteinG: 44, carbsG: 36, fatG: 55 },
  },
  createdAt: "2026-10-30T00:00:00.000Z",
};

const saveRecipe = vi.fn(async () => savedRecipeFixture);
const listSavedRecipes = vi.fn(async () => [savedRecipeFixture]);
const deleteSavedRecipe = vi.fn(async () => undefined);

vi.mock("../src/services/recipes/savedRecipes.js", () => ({
  saveRecipe: (...args: unknown[]) => saveRecipe(...args),
  listSavedRecipes: (...args: unknown[]) => listSavedRecipes(...args),
  deleteSavedRecipe: (...args: unknown[]) => deleteSavedRecipe(...args),
}));

const { buildServer } = await import("../src/server.js");

const saveRequestBody = {
  dishName: "cheesecake",
  goalMode: "cutting",
  servings: 4,
  resolvedGoals: savedRecipeFixture.resolvedGoals,
  standard: savedRecipeFixture.standard,
  upgraded: savedRecipeFixture.upgraded,
};

describe("saved recipes routes", () => {
  let app: FastifyInstance;

  afterEach(async () => {
    await app?.close();
    vi.clearAllMocks();
  });

  it("rejects every route without a bearer token", async () => {
    app = await buildServer();

    const post = await app.inject({ method: "POST", url: "/api/recipes", payload: saveRequestBody });
    const get = await app.inject({ method: "GET", url: "/api/recipes" });
    const del = await app.inject({ method: "DELETE", url: `/api/recipes/${savedRecipeFixture.id}` });

    expect(post.statusCode).toBe(401);
    expect(get.statusCode).toBe(401);
    expect(del.statusCode).toBe(401);
  });

  it("saves a recipe for an authenticated user and never trusts a client-supplied user id", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: { sub: "user-123" } });
    app = await buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/recipes",
      headers: { authorization: "Bearer good-token" },
      // Even if a client tried to smuggle a userId in the body, the route
      // schema rejects unknown fields (.strict()) and the service only
      // ever receives the id from the verified token, not this payload.
      payload: { ...saveRequestBody, userId: "someone-elses-id" },
    });

    expect(response.statusCode).toBe(400); // rejected by .strict(), never reaches the service
    expect(saveRecipe).not.toHaveBeenCalled();
  });

  it("saves a well-formed recipe, passing the verified user id and access token through", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: { sub: "user-123" } });
    app = await buildServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/recipes",
      headers: { authorization: "Bearer good-token" },
      payload: saveRequestBody,
    });

    expect(response.statusCode).toBe(201);
    expect(saveRecipe).toHaveBeenCalledWith("good-token", "user-123", saveRequestBody);
    expect(response.json().dishName).toBe("cheesecake");
  });

  it("lists saved recipes for an authenticated user", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: { sub: "user-123" } });
    app = await buildServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/recipes",
      headers: { authorization: "Bearer good-token" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().recipes).toHaveLength(1);
    expect(listSavedRecipes).toHaveBeenCalledWith("good-token");
  });

  it("deletes a saved recipe by id for an authenticated user", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: { sub: "user-123" } });
    app = await buildServer();

    const response = await app.inject({
      method: "DELETE",
      url: `/api/recipes/${savedRecipeFixture.id}`,
      headers: { authorization: "Bearer good-token" },
    });

    expect(response.statusCode).toBe(204);
    expect(deleteSavedRecipe).toHaveBeenCalledWith("good-token", savedRecipeFixture.id);
  });

  it("rejects a malformed recipe id", async () => {
    jwtVerify.mockResolvedValueOnce({ payload: { sub: "user-123" } });
    app = await buildServer();

    const response = await app.inject({
      method: "DELETE",
      url: "/api/recipes/not-a-uuid",
      headers: { authorization: "Bearer good-token" },
    });

    expect(response.statusCode).toBe(400);
    expect(deleteSavedRecipe).not.toHaveBeenCalled();
  });
});

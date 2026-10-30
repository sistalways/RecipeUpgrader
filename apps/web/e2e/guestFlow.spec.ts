import { expect, test } from "@playwright/test";

const MOCK_UPGRADE_RESPONSE = {
  resolvedGoals: { caloriesPerServing: 700, minProteinPerServingG: 30, servings: 2 },
  standard: {
    recipe: {
      title: "Pancakes",
      servings: 2,
      ingredients: [{ name: "flour", quantity: 100, unit: "g" }],
      steps: ["Mix and cook."],
    },
    macrosPerServing: { caloriesKcal: 400, proteinG: 20, carbsG: 40, fatG: 20 },
  },
  upgraded: {
    recipe: {
      title: "High-Protein Pancakes",
      servings: 2,
      ingredients: [{ name: "protein flour", quantity: 100, unit: "g" }],
      steps: ["Mix and cook."],
      substitutionNotes: "Swapped in a protein-boosted flour.",
    },
    macrosPerServing: { caloriesKcal: 673, proteinG: 52, carbsG: 62, fatG: 30 },
  },
  goalsMet: true,
};

test("guest can upgrade a recipe end to end, without an account", async ({ page }) => {
  await page.route("**/api/upgrade", async (route) => {
    await route.fulfill({ json: MOCK_UPGRADE_RESPONSE });
  });

  await page.goto("/");

  // Login isn't configured in this test environment, so the app goes
  // straight to the tool - the actual guest path judges will hit.
  await expect(page.getByRole("heading", { name: "Upgrade a recipe" })).toBeVisible();

  await page.getByPlaceholder("e.g. cheesecake").fill("pancakes");
  await page.getByText("Bulking", { exact: true }).click();
  await page.getByRole("button", { name: "Upgrade recipe" }).click();

  await expect(page.getByRole("heading", { name: "Standard recipe" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upgraded recipe" })).toBeVisible();
  await expect(page.getByText("High-Protein Pancakes")).toBeVisible();
  await expect(page.getByText(/fewer calories|more calories/)).toBeVisible();
});

test("the form locks while a recipe is generating", async ({ page }) => {
  await page.route("**/api/upgrade", async (route) => {
    // Hold the response open long enough to observe the locked state.
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ json: MOCK_UPGRADE_RESPONSE });
  });

  await page.goto("/");
  await page.getByPlaceholder("e.g. cheesecake").fill("pancakes");
  await page.getByRole("button", { name: "Upgrade recipe" }).click();

  await expect(page.getByPlaceholder("e.g. cheesecake")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Upgrading…" })).toBeVisible();
});

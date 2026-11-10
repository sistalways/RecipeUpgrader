import { expect, test, type Page } from "@playwright/test";

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

// Must match VITE_SUPABASE_URL in playwright.config.ts: supabase-js keeps
// the session in localStorage under "sb-<project ref>-auth-token".
const SUPABASE_ORIGIN = "https://e2e-fake.supabase.co";
const SESSION_STORAGE_KEY = "sb-e2e-fake-auth-token";
const ACCESS_TOKEN = "e2e-access-token";

/**
 * Stands in for a completed Google sign-in: seeds a session that's valid
 * for an hour, so supabase-js uses it without trying to refresh it, and
 * answers any other Supabase call so nothing leaves the machine.
 */
async function signIn(page: Page) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const session = {
    access_token: ACCESS_TOKEN,
    refresh_token: "e2e-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: nowSeconds + 3600,
    user: {
      id: "00000000-0000-4000-8000-000000000001",
      aud: "authenticated",
      role: "authenticated",
      email: "tester@example.com",
      app_metadata: { provider: "google" },
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  };
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, value),
    [SESSION_STORAGE_KEY, JSON.stringify(session)] as const,
  );
  await page.route(`${SUPABASE_ORIGIN}/**`, (route) => route.fulfill({ json: {} }));
}

test("signed-out visitors only see Google sign-in, with no way to skip it", async ({ page }) => {
  let upgradeCalled = false;
  await page.route("**/api/upgrade", async (route) => {
    upgradeCalled = true;
    await route.fulfill({ json: MOCK_UPGRADE_RESPONSE });
  });
  await page.route(`${SUPABASE_ORIGIN}/**`, (route) => route.fulfill({ json: {} }));

  await page.goto("/");

  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: /guest/i })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Upgrade a recipe" })).toHaveCount(0);
  expect(upgradeCalled).toBe(false);
});

test("a signed-in user can upgrade a recipe end to end", async ({ page }) => {
  await signIn(page);
  let authorization: string | undefined;
  await page.route("**/api/upgrade", async (route) => {
    authorization = route.request().headers().authorization;
    await route.fulfill({ json: MOCK_UPGRADE_RESPONSE });
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Upgrade a recipe" })).toBeVisible();

  await page.getByPlaceholder("e.g. cheesecake").fill("pancakes");
  await page.getByText("Bulking", { exact: true }).click();
  await page.getByRole("button", { name: "Upgrade recipe" }).click();

  await expect(page.getByRole("heading", { name: "Standard recipe" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Upgraded recipe" })).toBeVisible();
  await expect(page.getByText("High-Protein Pancakes")).toBeVisible();
  await expect(page.getByText(/fewer calories|more calories/)).toBeVisible();
  // The API rejects upgrades without this, so the client must send it.
  expect(authorization).toBe(`Bearer ${ACCESS_TOKEN}`);
});

test("the form locks while a recipe is generating", async ({ page }) => {
  await signIn(page);
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

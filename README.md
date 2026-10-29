# RecipeUpgrader

Turns a dish name into a recipe that fits your fitness goal, using ingredients you can actually buy nearby.

Built for the **Nebius x NVIDIA Global AI Hackathon**. Full architecture, conventions, and security rules live in [PROJECT.md](./PROJECT.md) — read that first if you're contributing.

## How it works

1. Name a dish (e.g. "cheesecake"), pick a goal — cutting, maintaining, or bulking — and set servings.
2. Your goal maps, in code, to a calorie and protein target per serving (no LLM involved in that step).
3. A fast **NVIDIA Nemotron** model (via **Nebius Token Factory**) generates a standard, typical recipe for that dish — the "before" baseline.
4. Macros are computed **in code** from USDA FoodData Central data — the LLM never invents nutrition numbers.
5. *(Coming soon)* Nearby grocery stores and ingredient availability, via OpenStreetMap + Tavily.
6. A reasoning Nemotron model rewrites the recipe to hit your resolved goals.
7. You see standard-vs-upgraded macros and the upgraded recipe. No login required.

## Project structure

```
apps/
  api/      Fastify + TypeScript backend — holds all API keys, validates everything with Zod
  web/      React + Vite + TypeScript frontend — no secrets, guest mode by default
packages/
  shared/   Zod schemas shared by both apps (single source of truth for request/response shapes)
```

## Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable` or `npm install -g pnpm`)
- API keys: a [Nebius Token Factory](https://tokenfactory.nebius.com/) account (for Nemotron models) and a [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html) API key

## Setup

```bash
pnpm install
cp .env.example apps/api/.env
```

Fill in `apps/api/.env`:

- `TOKEN_FACTORY_API_KEY`, `TOKEN_FACTORY_BASE_URL` — from Nebius Token Factory
- `MODEL_FAST` — a Nemotron Nano/Super model ID for recipe parsing
- `MODEL_REASONING` — a Nemotron Ultra model ID for the rewrite step
- `USDA_API_KEY` — from FoodData Central

Everything else in `.env.example` (Tavily, Kroger, Supabase) is for features not wired in yet — safe to leave blank.

## Run it locally

In two terminals, from the repo root:

```bash
# Terminal 1 — API, http://localhost:3000
pnpm dev:api

# Terminal 2 — Web UI, http://localhost:5173
pnpm dev:web
```

Open http://localhost:5173, paste a recipe, set your goals, and submit. The API must be running first — the web app calls it at `VITE_API_BASE_URL` (defaults to `http://localhost:3000`, no `.env` needed for local dev unless you change the port).

If `apps/api/.env` is missing or malformed, the API refuses to start and prints which variable is wrong — it never starts in a broken/insecure state.

## Testing

```bash
pnpm lint
pnpm typecheck
pnpm test
```

`apps/api` has unit tests for the pure nutrition math, the prompt-injection sanitizer, and shared schema edge cases, plus an integration test for `POST /api/upgrade` with the LLM and USDA calls mocked.

## Nebius Token Factory / NVIDIA Nemotron / Tavily usage

- All LLM calls go through **Nebius Token Factory**, speaking the OpenAI-compatible API, calling **NVIDIA Nemotron** models only. No other LLM provider appears anywhere in the codebase. The only code path allowed to call Token Factory is `apps/api/src/services/llm/` (`client.ts` + `callModel.ts`) — see PROJECT.md section 2 and 9.
- Two model tiers: a fast model (`MODEL_FAST`) generates a standard recipe for the dish name, and a reasoning model (`MODEL_REASONING`) rewrites it to hit the goal. Every model response is parsed as JSON and validated with a schema before anything downstream sees it; invalid output gets one retry, then a safe `502` — never raw model output to the client.
- Tavily (ingredient availability search) is planned but not wired into the pipeline yet; when it lands, raw web results will be condensed into structured `{ ingredient, store, available, priceUsd? }` facts before ever reaching a prompt.

## Deployment

The API deploys to **Render**, the website to **Cloudflare Pages**. Both platforms build this repo themselves — nothing is deployed from your machine, and no `.env` file is involved; every value below is entered into that platform's own dashboard.

### API → Render

1. In the Render dashboard: **New +** → **Blueprint**, point it at this GitHub repo. Render reads [`render.yaml`](./render.yaml) and sets up the service automatically.
2. Render will prompt you to fill in these values (nothing here has a default — Render asks because the blueprint marks them `sync: false`, meaning "ask the human, don't commit it"):
   - `TOKEN_FACTORY_API_KEY`, `TOKEN_FACTORY_BASE_URL`, `MODEL_FAST`, `MODEL_REASONING` — same values as your local `apps/api/.env`
   - `USDA_API_KEY` — same as local
   - `ALLOWED_ORIGINS` — leave a placeholder for now (e.g. `https://example.com`); you'll come back and set this to the real Cloudflare Pages URL once that's deployed (step 4 below)
3. Deploy. Render gives you a URL like `https://recipeupgrader-api.onrender.com`. Confirm it's alive: `curl https://<your-render-url>/api/health` should return `{"status":"ok"}`.
4. Once the website is deployed (next section) and you have its URL, go back to the Render service's **Environment** tab and set `ALLOWED_ORIGINS` to that URL, then let it redeploy.

### Website → Cloudflare Pages

1. In the Cloudflare dashboard: **Workers & Pages** → **Create** → **Pages** → **Connect to Git**, pick this repo.
2. Build settings:
   - **Framework preset:** None (or Vite)
   - **Build command:** `NODE_ENV=development pnpm install --frozen-lockfile && pnpm --filter @recipeupgrader/web... run build` (Cloudflare Pages sets `NODE_ENV=production` by default, which makes pnpm skip the dev tools — vite, typescript — needed to actually build; the override is just for this install step)
   - **Build output directory:** `apps/web/dist`
   - **Root directory:** `/` (repo root — leave default)
3. Environment variable (build-time): `VITE_API_BASE_URL` = the Render URL from step 3 above (e.g. `https://recipeupgrader-api.onrender.com`).
4. Deploy. Cloudflare gives you a URL like `https://recipeupgrader.pages.dev`. Use that to fill in Render's `ALLOWED_ORIGINS` (step 4 above).

## Status

Guest-mode recipe upgrade flow (generate a standard recipe → compute macros → rewrite to hit the goal → recompute macros) works end to end, verified against the real Nebius Token Factory / Nemotron models. Location/availability, Supabase auth, saved recipes, and some of the security hardening are still in progress — see PROJECT.md for the full plan and [SECURITY.md](./SECURITY.md) *(coming soon)* for the threat model.

## Feedback

Found a bug or have a suggestion? Open an issue on this repo.

## License

MIT — see [LICENSE](./LICENSE).

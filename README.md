# RecipeUpgrader

Turns a dish name into a recipe that fits your fitness goal, using ingredients you can actually buy nearby.

Built for the **Nebius x NVIDIA Global AI Hackathon**. Full architecture, conventions, and security rules live in [PROJECT.md](./PROJECT.md) — read that first if you're contributing.

## How it works

1. Name a dish (e.g. "cheesecake"), pick a goal — cutting, maintaining, or bulking — and set servings.
2. Your goal maps, in code, to a calorie and protein target per serving (no LLM involved in that step).
3. A fast **NVIDIA Nemotron** model (via **Nebius Token Factory**) generates a standard, typical recipe for that dish — the "before" baseline.
4. Macros are computed **in code** from USDA FoodData Central data — the LLM never invents nutrition numbers.
5. Optionally share a ZIP code or your location — RecipeUpgrader finds nearby grocery stores (OpenStreetMap) and checks which common high-protein substitutes are actually sold there (Tavily), so the rewrite can prefer what's really available.
6. A reasoning Nemotron model rewrites the recipe to hit your resolved goals, preferring ingredients confirmed available nearby.
7. You see standard-vs-upgraded macros and the upgraded recipe. Works as a guest, or sign in to save recipes for later.

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

Everything else in `.env.example` is optional. `TAVILY_API_KEY` enables the nearby-availability check (location/ZIP input still works without it, it just skips that step); `SUPABASE_*` enables login and saved recipes; `KROGER_*` isn't implemented.

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
- Tavily powers the optional nearby-availability check: for a curated list of common substitute ingredients, it searches whether the nearest store (found via OpenStreetMap) actually sells each one. Raw search results never reach a prompt — they're condensed into structured `{ ingredient, store, available, priceUsd? }` facts first, before the rewrite step ever sees them.

## Deployment

The API runs on **Render**, the website on **Cloudflare Pages**. Both are configured directly in their own dashboards, not from files in this repo (`render.yaml` covers the API's service definition; the dashboard holds the actual secrets).

## Status

The full recipe upgrade flow (generate a standard recipe → compute macros → optional nearby-availability check → rewrite → recompute macros) works end to end, deployed and verified against the real Nebius Token Factory / Nemotron models. Login and saved recipes work too, as an optional layer on top of the guest flow. Kroger and a Supabase-backed cache (vs. the current in-memory one) are not implemented — see PROJECT.md for the full plan and [SECURITY.md](./SECURITY.md) for the threat model and what's actually built versus still a gap.

## Feedback

Found a bug or have a suggestion? Open an issue on this repo.

## License

MIT — see [LICENSE](./LICENSE).

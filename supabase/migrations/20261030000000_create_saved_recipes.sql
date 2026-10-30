-- Saved recipes, scoped to the user who saved them.
--
-- This matches what's actually running in the Supabase project today - it
-- was originally created by hand through the SQL Editor, not the Supabase
-- CLI, so this file is a record of that schema for reproducibility
-- (PROJECT.md's folder layout calls for migrations here), not something
-- that's been run through `supabase migrate` against this exact file yet.
--
-- Row-level security is the actual enforcement for "a user can only see
-- their own recipes" - the backend queries this table using a Supabase
-- client scoped to that user's own access token (see
-- apps/api/src/services/recipes/supabaseClient.ts), never the service
-- role key, so these policies are what's really doing the work.

create table if not exists public.saved_recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dish_name text not null,
  goal_mode text not null check (goal_mode in ('cutting', 'maintaining', 'bulking')),
  servings integer not null,
  resolved_goals jsonb not null,
  standard_recipe jsonb not null,
  upgraded_recipe jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.saved_recipes enable row level security;

create policy "Users can read their own recipes"
  on public.saved_recipes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recipes"
  on public.saved_recipes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own recipes"
  on public.saved_recipes for delete
  using (auth.uid() = user_id);

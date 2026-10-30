import { SavedRecipeSchema, type SaveRecipeRequest, type SavedRecipe } from "@recipeupgrader/shared";
import { UpstreamError } from "../../lib/errors.js";
import { createUserScopedClient } from "./supabaseClient.js";

const TABLE = "saved_recipes";

/**
 * The saved_recipes table uses snake_case column names (standard Postgres
 * convention); the rest of this codebase uses camelCase. This is the only
 * place that translates between the two.
 */
interface SavedRecipeRow {
  id: string;
  dish_name: string;
  goal_mode: string;
  servings: number;
  resolved_goals: unknown;
  standard_recipe: unknown;
  upgraded_recipe: unknown;
  created_at: string;
}

function rowToSavedRecipe(row: SavedRecipeRow): SavedRecipe {
  // Parsed with the same schema the client validates against - a
  // malformed row fails loudly instead of silently reaching the client.
  return SavedRecipeSchema.parse({
    id: row.id,
    dishName: row.dish_name,
    goalMode: row.goal_mode,
    servings: row.servings,
    resolvedGoals: row.resolved_goals,
    standard: row.standard_recipe,
    upgraded: row.upgraded_recipe,
    createdAt: row.created_at,
  });
}

/**
 * userId comes from the verified JWT (request.user.id), never from the
 * request body. Row-level security double-checks this independently: the
 * insert policy requires auth.uid() = user_id, so even a bug here that
 * passed the wrong ID would be rejected by Postgres, not just by this code.
 */
export async function saveRecipe(
  accessToken: string,
  userId: string,
  data: SaveRecipeRequest,
): Promise<SavedRecipe> {
  const client = createUserScopedClient(accessToken);

  const { data: row, error } = await client
    .from(TABLE)
    .insert({
      user_id: userId,
      dish_name: data.dishName,
      goal_mode: data.goalMode,
      servings: data.servings,
      resolved_goals: data.resolvedGoals,
      standard_recipe: data.standard,
      upgraded_recipe: data.upgraded,
    })
    .select()
    .single();

  if (error || !row) {
    throw new UpstreamError("Failed to save recipe");
  }

  return rowToSavedRecipe(row as SavedRecipeRow);
}

export async function listSavedRecipes(accessToken: string): Promise<SavedRecipe[]> {
  const client = createUserScopedClient(accessToken);

  const { data: rows, error } = await client
    .from(TABLE)
    .select()
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new UpstreamError("Failed to load saved recipes");
  }

  return (rows as SavedRecipeRow[]).map(rowToSavedRecipe);
}

export async function deleteSavedRecipe(accessToken: string, id: string): Promise<void> {
  const client = createUserScopedClient(accessToken);

  const { error } = await client.from(TABLE).delete().eq("id", id);
  if (error) {
    throw new UpstreamError("Failed to delete recipe");
  }
}

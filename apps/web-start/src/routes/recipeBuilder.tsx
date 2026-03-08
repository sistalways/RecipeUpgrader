import { useState } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useApiMutation, useApiQuery } from '../integrations/api';
import { NavigationBar } from '../components/NavigationBar';
import type { IngredientCreateIn } from '@repo/api/ingredients/dto/ingredients.dto';
import type { RecipeCreateIn, RecipeOut } from '@repo/api/recipes/dto/recipes.dto';

export const Route = createFileRoute('/recipeBuilder')({
  component: RouteComponent,
});

type Recipe = RecipeOut & {
  ingredients?: Array<{
    id: number;
    ingredientName: string | null;
    ingredientQuantity: number;
  }>;
};

function RouteComponent() {
  const [showModal, setShowModal] = useState<'create' | 'addIngredient' | null>(null);
  const [recipeToDelete, setRecipeToDelete] = useState<number | null>(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);

  const q = useApiQuery<Array<Recipe>>(['recipes'], '/recipes');

  const recipes = q.data ?? [];
  const loading = q.showLoading;
  const error = q.error ? q.error.message : null;

  const [formData, setFormData] = useState({
    recipeName: '',
  });

  const [ingredientFormData, setIngredientFormData] = useState({
    ingredientName: '',
    ingredientQuantity: 1,
  });

  const resetForm = () => {
    setFormData({ recipeName: '' });
  };

  const resetIngredientForm = () => {
    setIngredientFormData({ ingredientName: '', ingredientQuantity: 1 });
  };

  const router = useRouter();

  const DEFAULT_USER_ID = 1;

  const createMutation = useApiMutation<RecipeCreateIn, RecipeOut>({
    path: '/recipes',
    method: 'POST',
    invalidateKeys: [['recipes']],
  });

  const deleteMutation = useApiMutation<{ id: number }, void>({
    endpoint: (vars) => ({ path: `/recipes/${vars.id}`, method: 'DELETE' }),
    invalidateKeys: [['recipes']],
  });

  const createIngredientMutation = useApiMutation<IngredientCreateIn, unknown>({
    path: '/ingredients',
    method: 'POST',
    invalidateKeys: [['recipes']],
  });

  const handleSubmit = async () => {
    try {
      await createMutation.mutateAsync({
        recipeName: formData.recipeName,
      });
      setShowModal(null);
      resetForm();
      router.navigate({ to: '/recipeBuilder' });
    } catch (err) {
      console.error('Mutation failed:', err);
    }
  };

  const handleDelete = async (recipeId: number) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this recipe? All ingredients will also be deleted.'
      )
    ) {
      return;
    }
    try {
      setRecipeToDelete(recipeId);
      await deleteMutation.mutateAsync({ id: recipeId });
      setRecipeToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setRecipeToDelete(null);
    }
  };

  const handleOpenAddIngredient = (recipeId: number) => {
    setSelectedRecipeId(recipeId);
    setShowModal('addIngredient');
  };

  const handleSubmitIngredient = async () => {
    if (!selectedRecipeId) return;
    try {
      await createIngredientMutation.mutateAsync({
        recipeId: selectedRecipeId,
        userId: DEFAULT_USER_ID,
        ingredientName: ingredientFormData.ingredientName || undefined,
        ingredientQuantity: ingredientFormData.ingredientQuantity,
      });
      setShowModal(null);
      setSelectedRecipeId(null);
      resetIngredientForm();
    } catch (err) {
      console.error('Create ingredient failed:', err);
    }
  };

  return (
    <div className="RecipeBuilderContent">
      <NavigationBar />
      <div className="RecipeBuilderBar">
        <button
          className="CreateRecipeButton"
          onClick={() => setShowModal('create')}
        >
          Create New Recipe
        </button>
      </div>
      <h1 className="RecipeBuilderTitle">My Recipes</h1>

      {loading ? (
        <div className="RecipeBuilderLoading">Loading recipes…</div>
      ) : error ? (
        <div className="RecipeBuilderError">Error loading recipes: {error}</div>
      ) : recipes.length === 0 ? (
        <div className="RecipeBuilderEmpty">No recipes found.</div>
      ) : (
        <div className="RecipeList">
          {recipes.map((recipe) => (
            <article key={recipe.id} className="RecipeCard">
              <div className="RecipeCardHeader">
                <h2 className="RecipeCardTitle">{recipe.recipeName}</h2>
                <div className="RecipeCardActions">
                  <span className="RecipeBadge">
                    {recipe.ingredients?.length ?? 0} ingredients
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenAddIngredient(recipe.id)}
                    className="AddIngredientButton"
                  >
                    Add Ingredient
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(recipe.id)}
                    className="DeleteButton"
                    disabled={recipeToDelete === recipe.id}
                  >
                    {recipeToDelete === recipe.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>

              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <div className="IngredientList">
                  {recipe.ingredients.map((ing) => (
                    <div key={ing.id} className="IngredientItem">
                      <div>
                        <h3 className="IngredientItemName">
                          {ing.ingredientName ?? 'Unnamed ingredient'}
                        </h3>
                        <div className="IngredientQuantity">
                          <strong>{ing.ingredientQuantity}</strong> unit(s)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="RecipeEmptyState">
                  <p className="RecipeEmptyStateText">
                    No ingredients in this recipe yet
                  </p>
                  <button
                    type="button"
                    className="RecipeEmptyStateButton"
                    onClick={() => handleOpenAddIngredient(recipe.id)}
                  >
                    Add Ingredients
                  </button>
                </div>
              )}

              <div className="RecipeCardFooter">
                Created{' '}
                {new Date(recipe.createdAt as unknown as string).toLocaleDateString(
                  'en-US',
                  { month: 'short', day: 'numeric', year: 'numeric' }
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal === 'create' && (
        <div className="ModalOverlay">
          <form
            className="RecipeForm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <h2 className="FormTitle">Create New Recipe</h2>

            <label className="FormLabel">
              Recipe Name
              <input
                type="text"
                placeholder="Enter Recipe Name"
                value={formData.recipeName}
                onChange={(e) =>
                  setFormData({ ...formData, recipeName: e.target.value })
                }
                className="FormInput"
              />
            </label>

            <div className="FormButtons">
              <button type="submit" className="SubmitButton">
                Submit
              </button>
              <button
                type="button"
                className="CancelButton"
                onClick={() => setShowModal(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showModal === 'addIngredient' && (
        <div className="ModalOverlay">
          <form
            className="RecipeForm"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitIngredient();
            }}
          >
            <h2 className="FormTitle">Add Ingredient</h2>

            <label className="FormLabel">
              Ingredient Name
              <input
                type="text"
                placeholder="Ingredient Name"
                value={ingredientFormData.ingredientName}
                onChange={(e) =>
                  setIngredientFormData({
                    ...ingredientFormData,
                    ingredientName: e.target.value,
                  })
                }
                className="FormInput"
              />
            </label>

            <label className="FormLabel">
              Quantity
              <input
                type="number"
                placeholder="Quantity"
                value={ingredientFormData.ingredientQuantity}
                onChange={(e) =>
                  setIngredientFormData({
                    ...ingredientFormData,
                    ingredientQuantity: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="FormInput"
                min={1}
              />
            </label>

            <div className="FormButtons">
              <button
                type="submit"
                className="SubmitButton"
                disabled={!ingredientFormData.ingredientName.trim()}
              >
                Add Ingredient
              </button>
              <button
                type="button"
                className="CancelButton"
                onClick={() => {
                  setShowModal(null);
                  setSelectedRecipeId(null);
                  resetIngredientForm();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default RouteComponent;

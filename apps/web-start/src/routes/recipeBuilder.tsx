import { createFileRoute } from '@tanstack/react-router'
import { useApiQuery,useApiMutation,useCurrentUser } from '../integrations/api'
import React, { useState } from 'react';


export const Route = createFileRoute('/recipeBuilder')({
  component: RouteComponent,
})


function RouteComponent() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    dishName: '',
    goal: '',
    allergies: '',
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    alert(
      'Recipe Created!\n'
    );
    setShowForm(false);
    setFormData({ dishName: '', goal: '', allergies: '' });
  };

  return (
    <div className="MainContent">
      <div className="AppTheme">
        <h1 className="AppHeading">This is Recipe Builder</h1>
        <p className="AppDesc">Create your custom recipe easily by Clicking the button below and filling out the form!!</p>

        <button className="CreateRecipeButton" onClick={() => setShowForm(true)}>
          Create Recipe
        </button>
      </div>

      {showForm && (
        <div className="ModalOverlay">
          <form className="RecipeForm" onSubmit={handleSubmit}>
            <h2 className="FormTitle">Create Your Recipe</h2>

            <label className="FormLabel">
              Dish Name:
              <input
                type="text"
                name="dishName"
                value={formData.dishName}
                onChange={handleChange}
                className="FormInput"
                required
              />
            </label>

            <label className="FormLabel">
              Are you bulking, cutting, or maintaining?
              <select
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                className="FormSelect"
                required
              >
                <option value="">--Select--</option>
                <option value="Bulking">Bulking</option>
                <option value="Cutting">Cutting</option>
                <option value="Maintaining">Maintaining</option>
              </select>
            </label>

            <label className="FormLabel">
              Any allergies or foods you don't like?
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="FormTextarea"
                placeholder="Enter allergies or foods to avoid..."
              />
            </label>

            <div className="FormButtons">
              <button type="submit" className="SubmitButton">
                Submit
              </button>
              <button
                type="button"
                className="CancelButton"
                onClick={() => setShowForm(false)}
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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RecipeState } from './recipe.state';
import { Recipe } from '../../models/recipe.model';

export const selectRecipeState = createFeatureSelector<RecipeState>('recipe');

// Select all recipes
export const selectAllRecipes = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.recipes
);

// Select recipes loading
export const selectRecipesLoading = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.recipesLoading
);

// Select recipes error
export const selectRecipesError = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.recipesError
);

// Select current recipe
export const selectCurrentRecipe = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.currentRecipe
);

// Select recipe by ID
export const selectRecipeById = createSelector(
  selectCurrentRecipe,
  (currentRecipe: Recipe | null) => currentRecipe
);

// Select loading states
export const selectRecipeLoading = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.currentRecipeLoading
);

// Select error states
export const selectRecipeError = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.currentRecipeError
);

// Select search results
export const selectSearchResults = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.searchResults
);

// Select search loading
export const selectSearchLoading = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.searchLoading
);

// Select search error
export const selectSearchError = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.searchError
);

// Select search query
export const selectSearchQuery = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.searchQuery
);

// Select operation loading
export const selectOperationLoading = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.operationLoading
);

// Select operation error
export const selectOperationError = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.operationError
);

// Select file upload states
export const selectImageUploadLoading = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.imageUploadLoading
);

export const selectVideoUploadLoading = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.videoUploadLoading
);

export const selectUploadError = createSelector(
  selectRecipeState,
  (state: RecipeState) => state.uploadError
);

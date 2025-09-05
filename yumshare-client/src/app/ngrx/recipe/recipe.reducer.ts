import { createReducer, on } from '@ngrx/store';
import { RecipeState, initialRecipeState } from './recipe.state';
import * as RecipeActions from './recipe.actions';

export const recipeReducer = createReducer(
  initialRecipeState,

  // Create Recipe
  on(RecipeActions.createRecipe, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(RecipeActions.createRecipeSuccess, (state, { recipe }) => ({
    ...state,
    operationLoading: false,
    operationError: null,
    currentRecipe: recipe,
  })),

  on(RecipeActions.createRecipeFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Create Recipe with Files
  on(RecipeActions.createRecipeWithFiles, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(RecipeActions.createRecipeWithFilesSuccess, (state, { recipe }) => ({
    ...state,
    operationLoading: false,
    operationError: null,
    currentRecipe: recipe,
  })),

  on(RecipeActions.createRecipeWithFilesFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Load Recipe by ID
  on(RecipeActions.loadRecipeById, (state) => ({
    ...state,
    currentRecipeLoading: true,
    currentRecipeError: null,
  })),

  on(RecipeActions.loadRecipeByIdSuccess, (state, { recipe }) => ({
    ...state,
    currentRecipe: recipe,
    currentRecipeLoading: false,
    currentRecipeError: null,
  })),

  on(RecipeActions.loadRecipeByIdFailure, (state, { error }) => ({
    ...state,
    currentRecipeLoading: false,
    currentRecipeError: error,
  })),

  // Update Recipe
  on(RecipeActions.updateRecipe, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(RecipeActions.updateRecipeSuccess, (state, { recipe }) => ({
    ...state,
    currentRecipe: recipe,
    operationLoading: false,
    operationError: null,
  })),

  on(RecipeActions.updateRecipeFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Update Recipe with Files
  on(RecipeActions.updateRecipeWithFiles, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(RecipeActions.updateRecipeWithFilesSuccess, (state, { recipe }) => ({
    ...state,
    currentRecipe: recipe,
    operationLoading: false,
    operationError: null,
  })),

  on(RecipeActions.updateRecipeWithFilesFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Delete Recipe
  on(RecipeActions.deleteRecipe, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(RecipeActions.deleteRecipeSuccess, (state, { id }) => ({
    ...state,
    currentRecipe: state.currentRecipe?.id === id ? null : state.currentRecipe,
    recipes: state.recipes.filter(recipe => recipe.id !== id),
    searchResults: state.searchResults.filter(recipe => recipe.id !== id),
    operationLoading: false,
    operationError: null,
  })),

  on(RecipeActions.deleteRecipeFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Search Recipes
  on(RecipeActions.searchRecipes, (state, { query }) => ({
    ...state,
    searchQuery: query,
    searchLoading: true,
    searchError: null,
  })),

  on(RecipeActions.searchRecipesSuccess, (state, { recipes }) => ({
    ...state,
    searchResults: recipes,
    searchLoading: false,
    searchError: null,
  })),

  on(RecipeActions.searchRecipesFailure, (state, { error }) => ({
    ...state,
    searchLoading: false,
    searchError: error,
  })),

  // Load All Recipes
  on(RecipeActions.loadAllRecipes, (state) => ({
    ...state,
    recipesLoading: true,
    recipesError: null,
  })),

  on(RecipeActions.loadAllRecipesSuccess, (state, { recipes }) => ({
    ...state,
    recipes,
    recipesLoading: false,
    recipesError: null,
  })),

  on(RecipeActions.loadAllRecipesFailure, (state, { error }) => ({
    ...state,
    recipesLoading: false,
    recipesError: error,
  })),

  // Get Recipes by Category
  on(RecipeActions.getRecipesByCategory, (state) => ({
    ...state,
    recipesLoading: true,
    recipesError: null,
  })),

  on(RecipeActions.getRecipesByCategorySuccess, (state, { recipes }) => ({
    ...state,
    recipes,
    recipesLoading: false,
    recipesError: null,
  })),

  on(RecipeActions.getRecipesByCategoryFailure, (state, { error }) => ({
    ...state,
    recipesLoading: false,
    recipesError: error,
  })),

  // Upload Recipe Image
  on(RecipeActions.uploadRecipeImage, (state) => ({
    ...state,
    imageUploadLoading: true,
    uploadError: null,
  })),

  on(RecipeActions.uploadRecipeImageSuccess, (state, { recipeId, imageUrl }) => ({
    ...state,
    imageUploadLoading: false,
    uploadError: null,
    currentRecipe: state.currentRecipe?.id === recipeId
      ? { ...state.currentRecipe, image_url: imageUrl }
      : state.currentRecipe,
  })),

  on(RecipeActions.uploadRecipeImageFailure, (state, { error }) => ({
    ...state,
    imageUploadLoading: false,
    uploadError: error,
  })),

  // Upload Recipe Video
  on(RecipeActions.uploadRecipeVideo, (state) => ({
    ...state,
    videoUploadLoading: true,
    uploadError: null,
  })),

  on(RecipeActions.uploadRecipeVideoSuccess, (state, { recipeId, videoUrl }) => ({
    ...state,
    videoUploadLoading: false,
    uploadError: null,
    currentRecipe: state.currentRecipe?.id === recipeId
      ? { ...state.currentRecipe, video_url: videoUrl }
      : state.currentRecipe,
  })),

  on(RecipeActions.uploadRecipeVideoFailure, (state, { error }) => ({
    ...state,
    videoUploadLoading: false,
    uploadError: error,
  })),

  // Clear Actions
  on(RecipeActions.clearRecipeState, () => initialRecipeState),

  on(RecipeActions.clearCurrentRecipe, (state) => ({
    ...state,
    currentRecipe: null,
    currentRecipeLoading: false,
    currentRecipeError: null,
  })),

  on(RecipeActions.clearSearchResults, (state) => ({
    ...state,
    searchQuery: '',
    searchResults: [],
    searchLoading: false,
    searchError: null,
  })),
);

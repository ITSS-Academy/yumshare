import { createAction, props } from '@ngrx/store';
import { Recipe } from '../../models/recipe.model';
import { RecipeStep } from '../../models/recipe-step.model';

// Create Recipe
export const createRecipe = createAction(
  '[Recipe] Create Recipe',
  props<{ recipe: Recipe }>()
);

export const createRecipeSuccess = createAction(
  '[Recipe] Create Recipe Success',
  props<{ recipe: Recipe }>()
);

export const createRecipeFailure = createAction(
  '[Recipe] Create Recipe Failure',
  props<{ error: string }>()
);

// Create Recipe with Files
export const createRecipeWithFiles = createAction(
  '[Recipe] Create Recipe with Files',
  props<{ recipeData: FormData }>()
);

export const createRecipeWithFilesSuccess = createAction(
  '[Recipe] Create Recipe with Files Success',
  props<{ recipe: Recipe }>()
);

export const createRecipeWithFilesFailure = createAction(
  '[Recipe] Create Recipe with Files Failure',
  props<{ error: string }>()
);

// Load Recipe by ID
export const loadRecipeById = createAction(
  '[Recipe] Load Recipe by ID',
  props<{ id: string }>()
);

export const loadRecipeByIdSuccess = createAction(
  '[Recipe] Load Recipe by ID Success',
  props<{ recipe: Recipe }>()
);

export const loadRecipeByIdFailure = createAction(
  '[Recipe] Load Recipe by ID Failure',
  props<{ error: string }>()
);

// Update Recipe
export const updateRecipe = createAction(
  '[Recipe] Update Recipe',
  props<{ id: string; recipe: Partial<Recipe> }>()
);

export const updateRecipeSuccess = createAction(
  '[Recipe] Update Recipe Success',
  props<{ recipe: Recipe }>()
);

export const updateRecipeFailure = createAction(
  '[Recipe] Update Recipe Failure',
  props<{ error: string }>()
);

// Update Recipe with Files
export const updateRecipeWithFiles = createAction(
  '[Recipe] Update Recipe with Files',
  props<{ id: string; recipeData: FormData }>()
);

export const updateRecipeWithFilesSuccess = createAction(
  '[Recipe] Update Recipe with Files Success',
  props<{ recipe: Recipe }>()
);

export const updateRecipeWithFilesFailure = createAction(
  '[Recipe] Update Recipe with Files Failure',
  props<{ error: string }>()
);

// Delete Recipe
export const deleteRecipe = createAction(
  '[Recipe] Delete Recipe',
  props<{ id: string }>()
);

export const deleteRecipeSuccess = createAction(
  '[Recipe] Delete Recipe Success',
  props<{ id: string }>()
);

export const deleteRecipeFailure = createAction(
  '[Recipe] Delete Recipe Failure',
  props<{ error: string }>()
);

// Search Recipes
export const searchRecipes = createAction(
  '[Recipe] Search Recipes',
  props<{ 
    query: string; 
    category?: string; 
    author?: string; 
    difficulty?: string;
    rating?: number;
    page?: number;
    size?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }>()
);

export const searchRecipesSuccess = createAction(
  '[Recipe] Search Recipes Success',
  props<{ recipes: PaginatedResponse<Recipe> }>()
);

export const searchRecipesFailure = createAction(
  '[Recipe] Search Recipes Failure',
  props<{ error: string }>()
);

// Get All Recipes
export const loadAllRecipes = createAction('[Recipe] Load All Recipes');

export const loadAllRecipesSuccess = createAction(
  '[Recipe] Load All Recipes Success',
  props<{ recipes: PaginatedResponse<Recipe> }>()
);

export const loadAllRecipesFailure = createAction(
  '[Recipe] Load All Recipes Failure',
  props<{ error: string }>()
);

// Get Recipes by Category
export const getRecipesByCategory = createAction(
  '[Recipe] Get Recipes by Category',
  props<{ 
    categoryId: string;
    page?: number;
    size?: number;
    orderBy?: string;
    order?: 'ASC' | 'DESC';
  }>()
);

export const getRecipesByCategorySuccess = createAction(
  '[Recipe] Get Recipes by Category Success',
  props<{ recipes: PaginatedResponse<Recipe> }>()
);

export const getRecipesByCategoryFailure = createAction(
  '[Recipe] Get Recipes by Category Failure',
  props<{ error: string }>()
);

// Load Recipes by User
export const loadRecipesByUser = createAction(
  '[Recipe] Load Recipes by User',
  props<{ 
    userId: string;
    queryOptions?: any;
  }>()
);

export const loadRecipesByUserSuccess = createAction(
  '[Recipe] Load Recipes by User Success',
  props<{ recipes: PaginatedResponse<Recipe> }>()
);

export const loadRecipesByUserFailure = createAction(
  '[Recipe] Load Recipes by User Failure',
  props<{ error: string }>()
);

// Upload Recipe Image
export const uploadRecipeImage = createAction(
  '[Recipe] Upload Recipe Image',
  props<{ recipeId: string; imageFile: File }>()
);

export const uploadRecipeImageSuccess = createAction(
  '[Recipe] Upload Recipe Image Success',
  props<{ recipeId: string; imageUrl: string }>()
);

export const uploadRecipeImageFailure = createAction(
  '[Recipe] Upload Recipe Image Failure',
  props<{ error: string }>()
);

// Upload Recipe Video
export const uploadRecipeVideo = createAction(
  '[Recipe] Upload Recipe Video',
  props<{ recipeId: string; videoFile: File }>()
);

export const uploadRecipeVideoSuccess = createAction(
  '[Recipe] Upload Recipe Video Success',
  props<{ recipeId: string; videoUrl: string }>()
);

export const uploadRecipeVideoFailure = createAction(
  '[Recipe] Upload Recipe Video Failure',
  props<{ error: string }>()
);

// Clear Recipe State
export const clearRecipeState = createAction('[Recipe] Clear Recipe State');

// Clear Current Recipe
export const clearCurrentRecipe = createAction('[Recipe] Clear Current Recipe');

// Clear Search Results
export const clearSearchResults = createAction('[Recipe] Clear Search Results');

// Load Paginated Recipes
import { PaginatedResponse } from '../../models/paginated-response.model';

export const loadPaginatedRecipes = createAction(
  '[Recipe] Load Paginated Recipes',
  props<{ 
    page?: number; 
    size?: number; 
    orderBy?: string; 
    order?: 'ASC' | 'DESC' 
  }>()
);

export const loadPaginatedRecipesSuccess = createAction(
  '[Recipe] Load Paginated Recipes Success',
  props<{ response: PaginatedResponse<Recipe> }>()
);

export const loadPaginatedRecipesFailure = createAction(
  '[Recipe] Load Paginated Recipes Failure',
  props<{ error: string }>()
);


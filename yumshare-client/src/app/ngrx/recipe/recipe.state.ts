import { Recipe } from '../../models';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface RecipeState {
  // Current Recipe
  currentRecipe: Recipe | null;
  currentRecipeLoading: boolean;
  currentRecipeError: string | null;

  // Recipe List (for category-based or search results)
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesError: string | null;

  // Paginated Recipe List
  paginatedRecipes: PaginatedResponse<Recipe> | null;
  paginatedRecipesLoading: boolean;
  paginatedRecipesError: string | null;

  // Search
  searchQuery: string;
  searchResults: Recipe[];
  searchLoading: boolean;
  searchError: string | null;

  // Create/Update/Delete operations
  operationLoading: boolean;
  operationError: string | null;

  // File uploads
  imageUploadLoading: boolean;
  videoUploadLoading: boolean;
  uploadError: string | null;

  getRecipesByCategory: Recipe[] | null;
  getRecipesByCategoryLoading: boolean;
  getRecipesByCategoryError: string | null;

  getRecipesByCategoryBeverages: Recipe[] | null;
  getRecipesByCategoryLoadingBeverages: boolean;
  getRecipesByCategoryErrorBeverages: string | null;

  getRecipesByCategoryDesserts: Recipe[] | null;
  getRecipesByCategoryLoadingDesserts: boolean;
  getRecipesByCategoryErrorDesserts: string | null;

  getRecipesByCategorySnacks: Recipe[] | null;
  getRecipesByCategoryLoadingSnacks: boolean;
  getRecipesByCategoryErrorSnacks: string | null;
}

export const initialRecipeState: RecipeState = {
  // Current Recipe
  currentRecipe: null,
  currentRecipeLoading: false,
  currentRecipeError: null,

  // Recipe List
  recipes: [],
  recipesLoading: false,
  recipesError: null,

  // Paginated Recipe List
  paginatedRecipes: null,
  paginatedRecipesLoading: false,
  paginatedRecipesError: null,

  // Search
  searchQuery: '',
  searchResults: [],
  searchLoading: false,
  searchError: null,

  // Operations
  operationLoading: false,
  operationError: null,

  // File uploads
  imageUploadLoading: false,
  videoUploadLoading: false,
  uploadError: null,

  getRecipesByCategory: null,
  getRecipesByCategoryLoading: false,
  getRecipesByCategoryError: null,

  getRecipesByCategoryBeverages: null,
  getRecipesByCategoryLoadingBeverages: false,
  getRecipesByCategoryErrorBeverages: null,

  getRecipesByCategoryDesserts: null,
  getRecipesByCategoryLoadingDesserts: false,
  getRecipesByCategoryErrorDesserts: null,

  getRecipesByCategorySnacks: null,
  getRecipesByCategoryLoadingSnacks: false,
  getRecipesByCategoryErrorSnacks: null,
};



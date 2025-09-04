import { Recipe } from '../../models';

export interface RecipeState {
  // Recipe State Interface
  id: string;
  user_id: string;
  title: string;
  description?: string;
  ingredients?: string[];
  image_url?: string;
  video_url?: string;
  total_cooking_time: number;
  servings: number;
  difficulty?: string;
  country?: string;
  category_id?: string;
  created_at: Date;
  updated_at: Date;

  // Current Recipe
  currentRecipe: Recipe | null;
  currentRecipeLoading: boolean;
  currentRecipeError: string | null;

  // Recipe List (for category-based or search results)
  recipes: Recipe[];
  recipesLoading: boolean;
  recipesError: string | null;

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
};



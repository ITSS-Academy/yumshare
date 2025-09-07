import { Favorite } from '../../models/favorite.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface FavoriteState {
  // User's Favorites List
  favorites: Favorite[];
  favoritesLoading: boolean;
  favoritesError: string | null;

  // Paginated Favorites
  paginatedFavorites: PaginatedResponse<Favorite> | null;
  paginatedFavoritesLoading: boolean;
  paginatedFavoritesError: string | null;

  // Favorite Count
  favoriteCount: number;
  favoriteCountLoading: boolean;
  favoriteCountError: string | null;

  // Favorite Status Check (for individual recipes)
  favoriteStatus: { [recipeId: string]: boolean };
  favoriteStatusLoading: { [recipeId: string]: boolean };
  favoriteStatusError: { [recipeId: string]: string | null };

  // Current User ID (for tracking which user's favorites we're managing)
  currentUserId: string | null;

  // Operation states (add/remove/toggle)
  operationLoading: boolean;
  operationError: string | null;

  // Toggle operation tracking
  toggleLoading: { [recipeId: string]: boolean };
  toggleError: { [recipeId: string]: string | null };
}

export const initialFavoriteState: FavoriteState = {
  // User's Favorites List
  favorites: [],
  favoritesLoading: false,
  favoritesError: null,

  // Paginated Favorites
  paginatedFavorites: null,
  paginatedFavoritesLoading: false,
  paginatedFavoritesError: null,

  // Favorite Count
  favoriteCount: 0,
  favoriteCountLoading: false,
  favoriteCountError: null,

  // Favorite Status Check
  favoriteStatus: {},
  favoriteStatusLoading: {},
  favoriteStatusError: {},

  // Current User ID
  currentUserId: null,

  // Operation states
  operationLoading: false,
  operationError: null,

  // Toggle operation tracking
  toggleLoading: {},
  toggleError: {},
};

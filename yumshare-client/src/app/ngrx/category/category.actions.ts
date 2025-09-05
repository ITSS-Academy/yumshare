import { createAction, props } from '@ngrx/store';
import { Category } from '../../models/category.model';

// Load Categories
export const loadCategories = createAction('[Category] Load Categories');

export const loadCategoriesSuccess = createAction(
  '[Category] Load Categories Success',
  props<{ categories: Category[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Category] Load Categories Failure',
  props<{ error: string }>()
);

// Load Category by ID
export const loadCategoryById = createAction(
  '[Category] Load Category by ID',
  props<{ id: string }>()
);

export const loadCategoryByIdSuccess = createAction(
  '[Category] Load Category by ID Success',
  props<{ category: Category }>()
);

export const loadCategoryByIdFailure = createAction(
  '[Category] Load Category by ID Failure',
  props<{ error: string }>()
);

// Create Category
export const createCategory = createAction(
  '[Category] Create Category',
  props<{ category: Omit<Category, 'id' | 'created_at' | 'updated_at'> }>()
);

export const createCategorySuccess = createAction(
  '[Category] Create Category Success',
  props<{ category: Category }>()
);

export const createCategoryFailure = createAction(
  '[Category] Create Category Failure',
  props<{ error: string }>()
);

// Update Category
export const updateCategory = createAction(
  '[Category] Update Category',
  props<{ id: string; category: Partial<Category> }>()
);

export const updateCategorySuccess = createAction(
  '[Category] Update Category Success',
  props<{ category: Category }>()
);

export const updateCategoryFailure = createAction(
  '[Category] Update Category Failure',
  props<{ error: string }>()
);

// Delete Category
export const deleteCategory = createAction(
  '[Category] Delete Category',
  props<{ id: string }>()
);

export const deleteCategorySuccess = createAction(
  '[Category] Delete Category Success',
  props<{ id: string }>()
);

export const deleteCategoryFailure = createAction(
  '[Category] Delete Category Failure',
  props<{ error: string }>()
);

// Load Active Categories
export const loadActiveCategories = createAction('[Category] Load Active Categories');

export const loadActiveCategoriesSuccess = createAction(
  '[Category] Load Active Categories Success',
  props<{ categories: Category[] }>()
);

export const loadActiveCategoriesFailure = createAction(
  '[Category] Load Active Categories Failure',
  props<{ error: string }>()
);

// Set Selected Category
export const setSelectedCategory = createAction(
  '[Category] Set Selected Category',
  props<{ category: Category | null }>()
);

// Clear Category State
export const clearCategoryState = createAction('[Category] Clear Category State');

// Clear Selected Category
export const clearSelectedCategory = createAction('[Category] Clear Selected Category');


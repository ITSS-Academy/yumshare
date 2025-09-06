import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CategoryState } from './category.state';

// Feature selector
export const selectCategoryState = createFeatureSelector<CategoryState>('category');

// Basic selectors
export const selectCategories = createSelector(
  selectCategoryState,
  (state) => state.categories
);

export const selectActiveCategories = createSelector(
  selectCategoryState,
  (state) => state.activeCategories
);

export const selectSelectedCategory = createSelector(
  selectCategoryState,
  (state) => state.selectedCategory
);

export const selectCurrentCategory = createSelector(
  selectCategoryState,
  (state) => state.currentCategory
);

// Loading selectors
export const selectCategoriesLoading = createSelector(
  selectCategoryState,
  (state) => state.categoriesLoading
);

export const selectActiveCategoriesLoading = createSelector(
  selectCategoryState,
  (state) => state.activeCategoriesLoading
);

export const selectCurrentCategoryLoading = createSelector(
  selectCategoryState,
  (state) => state.currentCategoryLoading
);

export const selectOperationLoading = createSelector(
  selectCategoryState,
  (state) => state.operationLoading
);

// Error selectors
export const selectCategoriesError = createSelector(
  selectCategoryState,
  (state) => state.categoriesError
);

export const selectActiveCategoriesError = createSelector(
  selectCategoryState,
  (state) => state.activeCategoriesError
);

export const selectCurrentCategoryError = createSelector(
  selectCategoryState,
  (state) => state.currentCategoryError
);

export const selectOperationError = createSelector(
  selectCategoryState,
  (state) => state.operationError
);

// Computed selectors
export const selectHasCategories = createSelector(
  selectCategories,
  (categories) => categories.length > 0
);

export const selectHasActiveCategories = createSelector(
  selectActiveCategories,
  (categories) => categories.length > 0
);

// Combined state selectors
export const selectCategoryListState = createSelector(
  selectCategories,
  selectCategoriesLoading,
  selectCategoriesError,
  (categories, loading, error) => ({
    categories,
    loading,
    error
  })
);

export const selectActiveCategoryListState = createSelector(
  selectActiveCategories,
  selectActiveCategoriesLoading,
  selectActiveCategoriesError,
  (activeCategories, loading, error) => ({
    activeCategories,
    loading,
    error
  })
);

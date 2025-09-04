import { createReducer, on } from '@ngrx/store';
import { CategoryState, initialCategoryState } from './category.state';
import * as CategoryActions from './category.actions';

export const categoryReducer = createReducer(
  initialCategoryState,

  // Load Categories
  on(CategoryActions.loadCategories, (state) => ({
    ...state,
    categoriesLoading: true,
    categoriesError: null,
  })),

  on(CategoryActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    categoriesLoading: false,
    categoriesError: null,
  })),

  on(CategoryActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    categoriesLoading: false,
    categoriesError: error,
  })),

  // Load Category by ID
  on(CategoryActions.loadCategoryById, (state) => ({
    ...state,
    currentCategoryLoading: true,
    currentCategoryError: null,
  })),

  on(CategoryActions.loadCategoryByIdSuccess, (state, { category }) => ({
    ...state,
    currentCategory: category,
    currentCategoryLoading: false,
    currentCategoryError: null,
  })),

  on(CategoryActions.loadCategoryByIdFailure, (state, { error }) => ({
    ...state,
    currentCategoryLoading: false,
    currentCategoryError: error,
  })),

  // Create Category
  on(CategoryActions.createCategory, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(CategoryActions.createCategorySuccess, (state, { category }) => ({
    ...state,
    categories: [...state.categories, category],
    activeCategories: category.is_active 
      ? [...state.activeCategories, category] 
      : state.activeCategories,
    operationLoading: false,
    operationError: null,
  })),

  on(CategoryActions.createCategoryFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Update Category
  on(CategoryActions.updateCategory, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(CategoryActions.updateCategorySuccess, (state, { category }) => ({
    ...state,
    categories: state.categories.map(cat => 
      cat.id === category.id ? category : cat
    ),
    activeCategories: state.activeCategories.map(cat => 
      cat.id === category.id ? category : cat
    ),
    currentCategory: state.currentCategory?.id === category.id 
      ? category 
      : state.currentCategory,
    selectedCategory: state.selectedCategory?.id === category.id 
      ? category 
      : state.selectedCategory,
    operationLoading: false,
    operationError: null,
  })),

  on(CategoryActions.updateCategoryFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Delete Category
  on(CategoryActions.deleteCategory, (state) => ({
    ...state,
    operationLoading: true,
    operationError: null,
  })),

  on(CategoryActions.deleteCategorySuccess, (state, { id }) => ({
    ...state,
    categories: state.categories.filter(cat => cat.id !== id),
    activeCategories: state.activeCategories.filter(cat => cat.id !== id),
    currentCategory: state.currentCategory?.id === id ? null : state.currentCategory,
    selectedCategory: state.selectedCategory?.id === id ? null : state.selectedCategory,
    operationLoading: false,
    operationError: null,
  })),

  on(CategoryActions.deleteCategoryFailure, (state, { error }) => ({
    ...state,
    operationLoading: false,
    operationError: error,
  })),

  // Load Active Categories
  on(CategoryActions.loadActiveCategories, (state) => ({
    ...state,
    activeCategoriesLoading: true,
    activeCategoriesError: null,
  })),

  on(CategoryActions.loadActiveCategoriesSuccess, (state, { categories }) => ({
    ...state,
    activeCategories: categories,
    activeCategoriesLoading: false,
    activeCategoriesError: null,
  })),

  on(CategoryActions.loadActiveCategoriesFailure, (state, { error }) => ({
    ...state,
    activeCategoriesLoading: false,
    activeCategoriesError: error,
  })),

  // Set Selected Category
  on(CategoryActions.setSelectedCategory, (state, { category }) => ({
    ...state,
    selectedCategory: category,
  })),

  // Clear Actions
  on(CategoryActions.clearCategoryState, () => initialCategoryState),

  on(CategoryActions.clearSelectedCategory, (state) => ({
    ...state,
    selectedCategory: null,
  })),
);

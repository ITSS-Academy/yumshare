import { Category } from '../../models/category.model';

export interface CategoryState {
  // All Categories
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Active Categories (for dropdowns, navigation)
  activeCategories: Category[];
  activeCategoriesLoading: boolean;
  activeCategoriesError: string | null;

  // Selected Category
  selectedCategory: Category | null;

  // Current Category (for detail view)
  currentCategory: Category | null;
  currentCategoryLoading: boolean;
  currentCategoryError: string | null;

  // Create/Update/Delete operations
  operationLoading: boolean;
  operationError: string | null;
}

export const initialCategoryState: CategoryState = {
  // All Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,

  // Active Categories
  activeCategories: [],
  activeCategoriesLoading: false,
  activeCategoriesError: null,

  // Selected Category
  selectedCategory: null,

  // Current Category
  currentCategory: null,
  currentCategoryLoading: false,
  currentCategoryError: null,

  // Operations
  operationLoading: false,
  operationError: null,
};

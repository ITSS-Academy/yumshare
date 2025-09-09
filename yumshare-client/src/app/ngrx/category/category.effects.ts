import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as CategoryActions from './category.actions';
import { CategoryService } from '../../services/category/category.service';

// Load Categories Effect
export const loadCategories = createEffect(
  (actions$ = inject(Actions), categoryService = inject(CategoryService)) => {
    return actions$.pipe(
      ofType(CategoryActions.loadCategories),
      switchMap(() =>
        categoryService.getCategories().pipe(
          map((response) => {
            // Handle both array and paginated response formats
            let categories: any[] = [];
            if (Array.isArray(response)) {
              categories = response;
            } else if (response && (response as any).data) {
              // Check if data is an array directly
              if (Array.isArray((response as any).data)) {
                categories = (response as any).data;
              } 
              // Check if data has nested data property
              else if ((response as any).data.data && Array.isArray((response as any).data.data)) {
                categories = (response as any).data.data;
              }
            }
            
            return CategoryActions.loadCategoriesSuccess({ categories });
          }),
          catchError((error) => {
            console.error('❌ Category Effect: Error loading categories:', error);
            return of(CategoryActions.loadCategoriesFailure({ error: error.message }));
          })
        )
      )
    );
  },
  { functional: true }
);

// Load Category by ID Effect
export const loadCategoryById = createEffect(
  (actions$ = inject(Actions), categoryService = inject(CategoryService)) => {
    return actions$.pipe(
      ofType(CategoryActions.loadCategoryById),
      switchMap(({ id }) =>
        categoryService.getCategories().pipe(
          map((response) => {
            const categories = response.data || response;
            const category = categories.find(cat => cat.id === id);
            if (category) {
              return CategoryActions.loadCategoryByIdSuccess({ category });
            } else {
              throw new Error('Category not found');
            }
          }),
          catchError((error) => of(CategoryActions.loadCategoryByIdFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Active Categories Effect
export const loadActiveCategories = createEffect(
  (actions$ = inject(Actions), categoryService = inject(CategoryService)) => {
    return actions$.pipe(
      ofType(CategoryActions.loadActiveCategories),
      switchMap(() =>
        categoryService.getCategories().pipe(
          map((response) => {
            const categories = response.data || response;
            const activeCategories = categories.filter(cat => cat.is_active);
            return CategoryActions.loadActiveCategoriesSuccess({ categories: activeCategories });
          }),
          catchError((error) => of(CategoryActions.loadActiveCategoriesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Create Category Effect (Mock - since RecipeService doesn't have category CRUD)
export const createCategory = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CategoryActions.createCategory),
      switchMap(({ category }) => {
        // Mock creation - in real app, you'd call category service
        const newCategory: any = {
          ...category,
          id: `cat-${Date.now()}`,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        return of(CategoryActions.createCategorySuccess({ category: newCategory }));
      })
    );
  },
  { functional: true }
);

// Update Category Effect (Mock)
export const updateCategory = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CategoryActions.updateCategory),
      switchMap(({ id, category }) => {
        // Mock update - in real app, you'd call category service
        const updatedCategory: any = {
          ...category,
          id,
          updated_at: new Date(),
        };
        
        return of(CategoryActions.updateCategorySuccess({ category: updatedCategory }));
      })
    );
  },
  { functional: true }
);

// Delete Category Effect (Mock)
export const deleteCategory = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CategoryActions.deleteCategory),
      switchMap(({ id }) => {
        // Mock deletion - in real app, you'd call category service
        return of(CategoryActions.deleteCategorySuccess({ id }));
      })
    );
  },
  { functional: true }
);

// Navigation effect after successful operations
export const navigateAfterCategoryCreate = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CategoryActions.createCategorySuccess),
      tap(({ category }) => {
        console.log(`Category created successfully: ${category.id}`);
        // You can inject Router here and navigate to category detail page
        // const router = inject(Router);
        // router.navigate(['/categories', category.id]);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Navigation effect after successful update
export const navigateAfterCategoryUpdate = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CategoryActions.updateCategorySuccess),
      tap(({ category }) => {
        console.log(`Category updated successfully: ${category.id}`);
        // You can inject Router here and navigate to category detail page
        // const router = inject(Router);
        // router.navigate(['/categories', category.id]);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Logging effect for debugging
export const logCategoryActions = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        CategoryActions.loadCategories,
        CategoryActions.createCategory,
        CategoryActions.updateCategory,
        CategoryActions.deleteCategory,
        CategoryActions.loadActiveCategories
      ),
      tap((action) => {
        console.log(`Category Action: ${action.type}`, action);
      })
    );
  },
  { functional: true, dispatch: false }
);

// export const
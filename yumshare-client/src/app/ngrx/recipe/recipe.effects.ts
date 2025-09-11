
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { RecipeService } from '../../services/recipe/recipe.service';
import * as RecipeActions from './recipe.actions';

// Load Recipe by ID Effect
export const loadRecipeByIdEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.loadRecipeById),
      switchMap(({ id }) =>
        recipeService.getRecipeById(id).pipe(
          map((recipe) => RecipeActions.loadRecipeByIdSuccess({ recipe })),
          catchError((error) => of(RecipeActions.loadRecipeByIdFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Create Recipe Effect
export const createRecipeEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.createRecipe),
      switchMap(({ recipe }) =>
        recipeService.createRecipe(recipe).pipe(
          map((createdRecipe) => RecipeActions.createRecipeSuccess({ recipe: createdRecipe })),
          catchError((error) => of(RecipeActions.createRecipeFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Create Recipe with Files Effect
export const createRecipeWithFilesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.createRecipeWithFiles),
      switchMap(({ recipeData }) =>
        recipeService.createRecipeWithFiles(recipeData).pipe(
          map((createdRecipe) => RecipeActions.createRecipeWithFilesSuccess({ recipe: createdRecipe })),
          catchError((error) => of(RecipeActions.createRecipeWithFilesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Update Recipe Effect
export const updateRecipeEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.updateRecipe),
      switchMap(({ id, recipe }) =>
        recipeService.updateRecipe(id, recipe).pipe(
          map((updatedRecipe) => RecipeActions.updateRecipeSuccess({ recipe: updatedRecipe })),
          catchError((error) => of(RecipeActions.updateRecipeFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Update Recipe with Files Effect
export const updateRecipeWithFilesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.updateRecipeWithFiles),
      switchMap(({ id, recipeData }) =>
        recipeService.updateRecipeWithFiles(id, recipeData).pipe(
          map((updatedRecipe) => RecipeActions.updateRecipeWithFilesSuccess({ recipe: updatedRecipe })),
          catchError((error) => of(RecipeActions.updateRecipeWithFilesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Delete Recipe Effect
export const deleteRecipeEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.deleteRecipe),
      switchMap(({ id, idToken }) =>
        recipeService.deleteRecipe(id, idToken).pipe(
          map(() => RecipeActions.deleteRecipeSuccess({ id })),
          catchError((error) => of(RecipeActions.deleteRecipeFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Search Recipes Effect
export const searchRecipesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.searchRecipes),
      switchMap(({ query, category, author, difficulty, rating, page, size, orderBy, order }) =>
        recipeService.searchRecipes(
          query, 
          category, 
          author, 
          difficulty, 
          rating, 
          page, 
          size, 
          orderBy, 
          order
        ).pipe(
          map((recipes) => RecipeActions.searchRecipesSuccess({ recipes })),
          catchError((error) => of(RecipeActions.searchRecipesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Recipes by User Effect
export const loadRecipesByUserEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.loadRecipesByUser),
      switchMap(({ userId, queryOptions }) =>
        recipeService.getRecipeByUserId(userId, queryOptions).pipe(
          map((recipes) => RecipeActions.loadRecipesByUserSuccess({ recipes })),
          catchError((error) => of(RecipeActions.loadRecipesByUserFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

          // Load All Recipes Effect
export const loadAllRecipesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.loadAllRecipes),
      switchMap(() =>
        recipeService.getAllRecipes(1, 8, 'created_at', 'DESC').pipe( // Load with pagination (8 per page)
          map((recipes) => RecipeActions.loadAllRecipesSuccess({ recipes })),
          catchError((error) => of(RecipeActions.loadAllRecipesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);
// Load All Recipes Effect
// export const loadAllRecipesEffect = createEffect(
//   (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
//     return actions$.pipe(
//       ofType(RecipeActions.loadAllRecipes),
//       switchMap(() =>
//         recipeService.getAllRecipes().pipe(
//           map((recipes) => RecipeActions.loadAllRecipesSuccess({ recipes })),
//           catchError((error) => of(RecipeActions.loadAllRecipesFailure({ error: error.message })))
//         )
//       )
//     );
//   },
//   { functional: true }
// );

// Get Recipes by Category Effect
export const getRecipesByCategoryEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.getRecipesByCategory),
      switchMap(({ categoryId, page, size, orderBy, order }) =>
        recipeService.getRecipesByCategory(categoryId, page, size, orderBy, order).pipe(
          map((recipes) => RecipeActions.getRecipesByCategorySuccess({ recipes })),
          catchError((error) => of(RecipeActions.getRecipesByCategoryFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get recipes by category main courses Effect
export const getRecipesByCategoryMainCoursesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.getRecipesByCategoryMainCourses),
      switchMap(({ categoryId }) =>
        recipeService.getRecipesByCategoryMainCourses(categoryId).pipe(
          map((recipes) => RecipeActions.getRecipesByCategoryMainCoursesSuccess({ recipeCategory: recipes })),
          catchError((error) => of(RecipeActions.getRecipesByCategoryMainCoursesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get Recipes by Category Beverages Effect
export const getRecipesByCategoryBeveragesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.getRecipesByCategoryBeverages),
      switchMap(({ categoryId }) =>
        recipeService.getRecipesByCategoryBeverages(categoryId).pipe(
          map((recipes) => RecipeActions.getRecipesByCategoryBeveragesSuccess({ recipeCategory: recipes })),
          catchError((error) => of(RecipeActions.getRecipesByCategoryBeveragesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get Recipes by Category Desserts Effect
export const getRecipesByCategoryDessertsEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.getRecipesByCategoryDesserts),
      switchMap(({ categoryId }) =>
        recipeService.getRecipesByCategoryDesserts(categoryId).pipe(
          map((recipes) => RecipeActions.getRecipesByCategoryDessertsSuccess({ recipeCategory: recipes })),
          catchError((error) => of(RecipeActions.getRecipesByCategoryDessertsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get Recipes by Category Snacks Effect
export const getRecipesByCategorySnacksEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.getRecipesByCategorySnacks),
      switchMap(({ categoryId }) => 
        recipeService.getRecipesByCategorySnacks(categoryId).pipe(
          map((recipes) => RecipeActions.getRecipesByCategorySnacksSuccess({ recipeCategory: recipes })),
          catchError((error) => of(RecipeActions.getRecipesByCategorySnacksFailure({ error: error.message })))
        )
      )
    );
  },  
  { functional: true }
);

// Upload Recipe Image Effect
export const uploadRecipeImageEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.uploadRecipeImage),
      switchMap(({ recipeId, imageFile }) =>
        recipeService.uploadRecipeImage(recipeId, imageFile).pipe(
          map((imageUrl) => RecipeActions.uploadRecipeImageSuccess({ recipeId, imageUrl })),
          catchError((error) => of(RecipeActions.uploadRecipeImageFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Upload Recipe Video Effect
export const uploadRecipeVideoEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.uploadRecipeVideo),
      switchMap(({ recipeId, videoFile }) =>
        recipeService.uploadRecipeVideo(recipeId, videoFile).pipe(
          map((videoUrl) => RecipeActions.uploadRecipeVideoSuccess({ recipeId, videoUrl })),
          catchError((error) => of(RecipeActions.uploadRecipeVideoFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Navigation effect after successful create
export const navigateAfterCreateEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(RecipeActions.createRecipeSuccess, RecipeActions.createRecipeWithFilesSuccess),
      tap(({ recipe }) => {
        // You can inject Router here and navigate to recipe detail page
        // const router = inject(Router);
        // router.navigate(['/recipes', recipe.id]);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Navigation effect after successful update
export const navigateAfterUpdateEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(RecipeActions.updateRecipeSuccess, RecipeActions.updateRecipeWithFilesSuccess),
      tap(({ recipe }) => {
        // You can inject Router here and navigate to recipe detail page
        // const router = inject(Router);
        // router.navigate(['/recipes', recipe.id]);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Logging effect for debugging
export const logRecipeActionsEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        RecipeActions.createRecipe,
        RecipeActions.updateRecipe,
        RecipeActions.deleteRecipe,
        RecipeActions.searchRecipes
      ),
      tap((action) => {
      })
    );
  },
  { functional: true, dispatch: false }
);


// Load Paginated Recipes Effect
export const loadPaginatedRecipesEffect = createEffect(
  (actions$ = inject(Actions), recipeService = inject(RecipeService)) => {
    return actions$.pipe(
      ofType(RecipeActions.loadPaginatedRecipes),
      switchMap(({ page, size, orderBy, order }) =>
        recipeService.getAllRecipes(page, size, orderBy, order).pipe(
          map((response) => RecipeActions.loadPaginatedRecipesSuccess({ response })),
          catchError((error) => of(RecipeActions.loadPaginatedRecipesFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);



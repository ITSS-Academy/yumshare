import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommentService } from '../../services/comment.service';
import * as CommentActions from './comment.actions';

// Load Comments Effect
export const loadCommentsEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.loadComments),
      switchMap(({ params }) =>
        commentService.getComments(params).pipe(
          map((response) => {
            const comments = response.data || [];
            const pagination = {
              currentPage: response.current_page || 1,
              totalPages: response.total_pages || 1,
              total: response.total || 0,
              hasNext: response.has_next || false,
              hasPrev: response.has_prev || false,
            };
            return CommentActions.loadCommentsSuccess({ comments, pagination });
          }),
          catchError((error) => of(CommentActions.loadCommentsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Comments by Recipe Effect
export const loadCommentsByRecipeEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.loadCommentsByRecipe),
      switchMap(({ recipeId, params }) =>
        commentService.getCommentsByRecipe(recipeId, params).pipe(
          map((response) => {
            const comments = response.data || [];
            const pagination = {
              currentPage: response.current_page || 1,
              totalPages: response.total_pages || 1,
              total: response.total || 0,
              hasNext: response.has_next || false,
              hasPrev: response.has_prev || false,
            };
            return CommentActions.loadCommentsByRecipeSuccess({ comments, pagination });
          }),
          catchError((error) => of(CommentActions.loadCommentsByRecipeFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Comments by User Effect
export const loadCommentsByUserEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.loadCommentsByUser),
      switchMap(({ userId, params }) =>
        commentService.getCommentsByUser(userId, params).pipe(
          map((response) => {
            const comments = response.data || [];
            const pagination = {
              currentPage: response.current_page || 1,
              totalPages: response.total_pages || 1,
              total: response.total || 0,
              hasNext: response.has_next || false,
              hasPrev: response.has_prev || false,
            };
            return CommentActions.loadCommentsByUserSuccess({ comments, pagination });
          }),
          catchError((error) => of(CommentActions.loadCommentsByUserFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Load Comment by ID Effect
export const loadCommentByIdEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.loadCommentById),
      switchMap(({ id }) =>
        commentService.getCommentById(id).pipe(
          map((comment) => CommentActions.loadCommentByIdSuccess({ comment })),
          catchError((error) => of(CommentActions.loadCommentByIdFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Create Comment Effect
export const createCommentEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.createComment),
      switchMap(({ commentData }) =>
        commentService.createComment(commentData).pipe(
          map((comment) => CommentActions.createCommentSuccess({ comment })),
          catchError((error) => of(CommentActions.createCommentFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Update Comment Effect
export const updateCommentEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.updateComment),
      switchMap(({ id, commentData }) =>
        commentService.updateComment(id, commentData).pipe(
          map((comment) => CommentActions.updateCommentSuccess({ comment })),
          catchError((error) => of(CommentActions.updateCommentFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Delete Comment Effect
export const deleteCommentEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.deleteComment),
      switchMap(({ id }) =>
        commentService.deleteComment(id).pipe(
          map(() => CommentActions.deleteCommentSuccess({ id })),
          catchError((error) => of(CommentActions.deleteCommentFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Search Comments Effect
export const searchCommentsEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.searchComments),
      switchMap(({ query, params }) =>
        commentService.searchComments(query, params).pipe(
          map((response) => {
            const comments = response.data || [];
            const pagination = {
              currentPage: response.current_page || 1,
              totalPages: response.total_pages || 1,
              total: response.total || 0,
              hasNext: response.has_next || false,
              hasPrev: response.has_prev || false,
            };
            return CommentActions.searchCommentsSuccess({ comments, pagination });
          }),
          catchError((error) => of(CommentActions.searchCommentsFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get Comment Count by Recipe Effect
export const getCommentCountByRecipeEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.getCommentCountByRecipe),
      switchMap(({ recipeId }) =>
        commentService.getCommentCountByRecipe(recipeId).pipe(
          map((response) => CommentActions.getCommentCountByRecipeSuccess({ recipeId, count: response.count })),
          catchError((error) => of(CommentActions.getCommentCountByRecipeFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Get Comment Count by User Effect
export const getCommentCountByUserEffect = createEffect(
  (actions$ = inject(Actions), commentService = inject(CommentService)) => {
    return actions$.pipe(
      ofType(CommentActions.getCommentCountByUser),
      switchMap(({ userId }) =>
        commentService.getCommentCountByUser(userId).pipe(
          map((response) => CommentActions.getCommentCountByUserSuccess({ userId, count: response.count })),
          catchError((error) => of(CommentActions.getCommentCountByUserFailure({ error: error.message })))
        )
      )
    );
  },
  { functional: true }
);

// Navigation effect after successful operations
export const navigateAfterCommentCreateEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CommentActions.createCommentSuccess),
      tap(({ comment }) => {
        console.log(`Comment created successfully: ${comment.id}`);
        // You can inject Router here and navigate to comment detail page
        // const router = inject(Router);
        // router.navigate(['/comments', comment.id]);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Navigation effect after successful update
export const navigateAfterCommentUpdateEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(CommentActions.updateCommentSuccess),
      tap(({ comment }) => {
        console.log(`Comment updated successfully: ${comment.id}`);
        // You can inject Router here and navigate to comment detail page
        // const router = inject(Router);
        // router.navigate(['/comments', comment.id]);
      })
    );
  },
  { functional: true, dispatch: false }
);

// Logging effect for debugging
export const logCommentActionsEffect = createEffect(
  (actions$ = inject(Actions)) => {
    return actions$.pipe(
      ofType(
        CommentActions.loadComments,
        CommentActions.createComment,
        CommentActions.updateComment,
        CommentActions.deleteComment,
        CommentActions.searchComments
      ),
      tap((action) => {
        console.log(`Comment Action: ${action.type}`, action);
      })
    );
  },
  { functional: true, dispatch: false }
);


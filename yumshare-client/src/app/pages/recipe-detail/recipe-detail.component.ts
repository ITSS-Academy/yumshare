import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, map, take, Subject, takeUntil, filter } from 'rxjs';
import { MatChip } from '@angular/material/chips';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { LazyImageDirective } from '../../directives/lazy-image/lazy-image.directive';
import { LoadingComponent } from '../../components/loading/loading.component';
import { CommentComponent } from './component/comment/comment.component';
import { Recipe } from '../../models/recipe.model';
import { User } from '../../models/user.model';
import { Comment } from '../../models/comment.model';
import { SafePipe } from '../../pipes/safe.pipe';

// NGRX imports
import * as RecipeActions from '../../ngrx/recipe/recipe.actions';
import * as AuthActions from '../../ngrx/auth/auth.actions';
import * as FollowActions from '../../ngrx/follow/follow.actions';
import * as CommentActions from '../../ngrx/comment/comment.actions';
import * as LikesActions from '../../ngrx/likes/likes.actions';

// Selectors
import { selectRecipeById, selectRecipeLoading, selectRecipeError } from '../../ngrx/recipe/recipe.selectors';
import { selectCurrentUser, selectAuthLoading } from '../../ngrx/auth/auth.selectors';
import { selectIsFollowing, selectIsLoading as selectFollowLoading } from '../../ngrx/follow/follow.selectors';
import { selectCommentsByRecipe, selectCommentsByRecipeLoading, selectCommentsByRecipeError } from '../../ngrx/comment/comment.selectors';
import {
  selectRecipeLikeCount,
  selectIsRecipeLikedByUser,
  selectLikesLoading,
  selectLikesForRecipe
} from '../../ngrx/likes/likes.selectors';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule,
    CommentComponent,
    MatChip,
    MatCheckbox,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    SafePipe,
    LazyImageDirective,
    LoadingComponent
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss'
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  // Recipe data
  recipe$: Observable<Recipe | null>;
  recipeLoading$: Observable<boolean>;
  recipeError$: Observable<string | null>;

  // Auth data
  currentUser$: Observable<any | null>;
  authLoading$: Observable<boolean>;

  // Follow data
  isFollowing$: Observable<boolean>;
  followLoading$: Observable<boolean>;

  // Comment data
  comments$: Observable<Comment[]>;
  commentsLoading$: Observable<boolean>;
  commentsError$: Observable<string | null>;

  // Likes data
  likeCount$!: Observable<number>;
  likeLoading$!: Observable<boolean>;
  isLiked$!: Observable<boolean>;
  likes$!: Observable<any[]>;

  // Local state
  recipeId: string = '';
  isFollowed = false;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Initialize observables
    this.recipe$ = this.store.select(selectRecipeById);
    this.recipeLoading$ = this.store.select(selectRecipeLoading);
    this.recipeError$ = this.store.select(selectRecipeError);

    this.currentUser$ = this.store.select(selectCurrentUser);
    this.authLoading$ = this.store.select(selectAuthLoading);

    this.isFollowing$ = this.store.select(selectIsFollowing).pipe(
      map(following => following === true)
    );
    this.followLoading$ = this.store.select(selectFollowLoading).pipe(
      map(loading => loading === true)
    );

    this.comments$ = this.store.select(selectCommentsByRecipe);
    this.commentsLoading$ = this.store.select(selectCommentsByRecipeLoading);
    this.commentsError$ = this.store.select(selectCommentsByRecipeError);
  }

  ngOnInit(): void {
    // Get recipe ID from route
    const routeSub = this.route.params.subscribe((params: any) => {
      this.recipeId = params['id'];
      if (this.recipeId) {
        this.loadRecipeData();
        this.loadComments();
        this.checkFollowStatus();
        this.loadLikes(); // load like khi vào recipe

        // Update selectors for likes with new recipeId
        this.likeCount$ = this.store.select(selectRecipeLikeCount(this.recipeId));
        this.likeLoading$ = this.store.select(selectLikesLoading);
        this.likes$ = this.store.select(selectLikesForRecipe(this.recipeId));
        this.isLiked$ = this.store.select(selectIsRecipeLikedByUser(this.recipeId));
      }
    });
    this.subscriptions.push(routeSub);

    // Subscribe to follow state
    const followSub = this.isFollowing$.subscribe(isFollowing => {
      this.isFollowed = isFollowing;
    });
    this.subscriptions.push(followSub);

    // Handle recipe errors
    const recipeErrorSub = this.recipeError$.subscribe(error => {
      if (error) {
        this.snackBar.open(`Error loading recipe: ${error}`, 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(recipeErrorSub);

    // Handle comment errors
    const commentErrorSub = this.commentsError$.subscribe(error => {
      if (error) {
        this.snackBar.open(`Error loading comments: ${error}`, 'Close', { duration: 3000 });
      }
    });
    this.subscriptions.push(commentErrorSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();

    this.store.dispatch(RecipeActions.clearRecipeState());
    this.store.dispatch(CommentActions.clearCommentState());
  }

  private loadRecipeData(): void {
    this.store.dispatch(RecipeActions.loadRecipeById({ id: this.recipeId }));
  }

  private loadComments(): void {
    this.store.dispatch(CommentActions.loadCommentsByRecipe({ recipeId: this.recipeId }));
  }

  private loadLikes(): void {
    this.store.dispatch(LikesActions.loadRecipeLikeCount({ recipeId: this.recipeId }));
    this.store.dispatch(LikesActions.loadRecipeLikes({ recipeId: this.recipeId }));
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user?.uid) {
        this.store.dispatch(LikesActions.checkIfLiked({ userId: user.uid, recipeId: this.recipeId }));
      }
    });
  }

  private checkFollowStatus(): void {
    const recipeSub = this.recipe$.subscribe(recipe => {
      if (recipe && recipe.user && recipe.user.id) {
        const userSub = this.currentUser$.subscribe(currentUser => {
          if (currentUser && currentUser.uid && currentUser.uid !== recipe.user!.id) {
            this.store.dispatch(FollowActions.checkFollowingStatus({
              followerId: currentUser.uid,
              followingId: recipe.user!.id
            }));
          }
        });
        this.subscriptions.push(userSub);
      }
    });
    this.subscriptions.push(recipeSub);
  }

  onFollowToggle(event: MatCheckboxChange): void {
    if (!this.recipeId) return;

    this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
      if (!currentUser || !currentUser.uid) {
        this.snackBar.open('Vui lòng đăng nhập để follow người dùng!', 'Đăng nhập', {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        event.source.checked = !event.checked;
        return;
      }

      this.recipe$.pipe(take(1)).subscribe((recipe: Recipe | null) => {
        if (recipe && recipe.user && recipe.user.id) {
          if (currentUser.uid !== recipe.user!.id) {
            if (event.checked) {
              this.store.dispatch(FollowActions.followUser({
                followerId: currentUser.uid,
                followingId: recipe.user!.id
              }));
            } else {
              this.store.dispatch(FollowActions.unfollowUser({
                followerId: currentUser.uid,
                followingId: recipe.user!.id
              }));
            }
          }
        }
      });
    });
  }

  toggleLike(): void {
    this.currentUser$.pipe(
      filter(user => !!user?.uid),
      take(1)
    ).subscribe(user => {
      this.store.dispatch(LikesActions.toggleLike({
        userId: user.uid!,
        recipeId: this.recipeId
      }));
    });
  }

  onLoginRequired(): void {
    this.snackBar.open('Vui lòng đăng nhập để sử dụng tính năng này!', 'Đăng nhập', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  onEditRecipe(): void {
    if (this.recipeId) {
      this.router.navigate(['/edit-recipe', this.recipeId]);
    }
  }

  onDeleteRecipe(): void {
    if (this.recipeId && confirm('Are you sure you want to delete this recipe?')) {
      this.store.dispatch(RecipeActions.deleteRecipe({ id: this.recipeId }));
      this.router.navigate(['/']);
    }
  }

  onCommentAdded(comment: Comment): void {
    this.loadComments();
  }

  onCommentDeleted(commentId: string): void {
    this.loadComments();
  }

  isOwner(recipe: Recipe, currentUser: any | null): boolean {
    return currentUser?.uid === recipe.user?.id;
  }

  canEdit(recipe: Recipe, currentUser: any | null): boolean {
    return this.isOwner(recipe, currentUser);
  }

  canDelete(recipe: Recipe, currentUser: any | null): boolean {
    return this.isOwner(recipe, currentUser);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#757575';
    }
  }

  getDifficultyText(difficulty: string): string {
    return difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1).toLowerCase() || 'Unknown';
  }

  getYouTubeEmbedUrl(url: string): string {
    if (!url) return '';

    let videoId = '';

    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
    }

    return url;
  }
}
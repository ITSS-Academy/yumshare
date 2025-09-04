import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, map, take } from 'rxjs';
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

// Selectors
import { selectRecipeById, selectRecipeLoading, selectRecipeError } from '../../ngrx/recipe/recipe.selectors';
import { selectCurrentUser, selectAuthLoading } from '../../ngrx/auth/auth.selectors';
import { selectIsFollowing, selectIsLoading as selectFollowLoading } from '../../ngrx/follow/follow.selectors';
import { selectCommentsByRecipe, selectCommentsByRecipeLoading, selectCommentsByRecipeError } from '../../ngrx/comment/comment.selectors';

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
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear recipe and comment state when leaving
    this.store.dispatch(RecipeActions.clearRecipeState());
    this.store.dispatch(CommentActions.clearCommentState());
  }

  private loadRecipeData(): void {
    this.store.dispatch(RecipeActions.loadRecipeById({ id: this.recipeId }));
  }

  private loadComments(): void {
    this.store.dispatch(CommentActions.loadCommentsByRecipe({ recipeId: this.recipeId }));
  }

  private checkFollowStatus(): void {
    // Cần đợi recipe load xong để có user.id của người tạo recipe
    const recipeSub = this.recipe$.subscribe(recipe => {
      if (recipe && recipe.user && recipe.user.id) {
        const userSub = this.currentUser$.subscribe(currentUser => {
          // Chỉ check follow status nếu đã đăng nhập và không phải chính mình
          if (currentUser && currentUser.uid && currentUser.uid !== recipe.user!.id) {
            // followerId: người đang xem recipe, followingId: người tạo recipe
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
    if (!this.recipeId) {
      return;
    }
    
    // Kiểm tra đăng nhập trước - sử dụng take(1) để chỉ lấy giá trị hiện tại
    this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
      if (!currentUser || !currentUser.uid) {
        // Chưa đăng nhập - chỉ hiển thị thông báo
        this.snackBar.open('Vui lòng đăng nhập để follow người dùng!', 'Đăng nhập', { 
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        // Reset checkbox về trạng thái cũ
        event.source.checked = !event.checked;
        return;
      }
      
      // Đã đăng nhập - tiếp tục logic follow
      this.recipe$.pipe(take(1)).subscribe((recipe: Recipe | null) => {
        if (recipe && recipe.user && recipe.user.id) {
          if (currentUser.uid !== recipe.user!.id) {
            if (event.checked) {
              // Follow người tạo recipe
              this.store.dispatch(FollowActions.followUser({ 
                followerId: currentUser.uid, 
                followingId: recipe.user!.id 
              }));
            } else {
              // Unfollow người tạo recipe
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



  onLoginRequired(): void {
    this.snackBar.open('Vui lòng đăng nhập để sử dụng tính năng này!', 'Đăng nhập', { 
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
    // Có thể redirect đến trang login nếu muốn
    // this.router.navigate(['/login']);
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
    // Refresh comments after adding new one
    this.loadComments();
  }

  onCommentDeleted(commentId: string): void {
    // Refresh comments after deleting one
    this.loadComments();
  }

  // Helper methods for template
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

  /**
   * Converts YouTube URLs to embed format
   * Supports multiple YouTube URL formats:
   * - https://www.youtube.com/watch?v=VIDEO_ID
   * - https://youtu.be/VIDEO_ID
   * - https://www.youtube.com/embed/VIDEO_ID
   */
  getYouTubeEmbedUrl(url: string): string {
    if (!url) return '';
    
    let videoId = '';
    
    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch?v=')) {
      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      // Format: https://youtu.be/VIDEO_ID
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      // Format: https://www.youtube.com/embed/VIDEO_ID
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    
    if (videoId) {
      // Return embed URL with additional parameters for better UX
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
    }
    
    // If not a valid YouTube URL, return original URL
    return url;
  }
}

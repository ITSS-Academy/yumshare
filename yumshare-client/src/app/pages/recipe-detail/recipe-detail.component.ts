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
import { TranslateService } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [
    CommonModule,
    CommentComponent,
    MatCheckbox,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    FormsModule,
    ScrollingModule,
    SafePipe,
    LazyImageDirective,
    LoadingComponent,
    TranslatePipe
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss'
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  
  // Virtual scrolling properties
  ingredientItemSize = 40; // Height of each ingredient item
  stepItemSize = 150; // Height of each step item
  
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

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private translate: TranslateService
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
        
        // Load likes with delay to ensure user auth is ready
        setTimeout(() => {
          this.loadLikes();
        }, 100);

        // Update selectors for likes with new recipeId
        this.likeCount$ = this.store.select(selectRecipeLikeCount(this.recipeId));
        this.likeLoading$ = this.store.select(selectLikesLoading);
        this.likes$ = this.store.select(selectLikesForRecipe(this.recipeId));
        this.isLiked$ = this.store.select(selectIsRecipeLikedByUser(this.recipeId));
        
        // Debug: Subscribe to isLiked$ to see state changes (remove when stable)
        // const debugSub = this.isLiked$.subscribe(isLiked => {
        //   // Debug log removed
        // });
        // this.subscriptions.push(debugSub);
        
        // Debug: Subscribe to like count changes (remove when stable)
        // const countDebugSub = this.likeCount$.subscribe(count => {
        //   // Debug log removed
        // });
        // this.subscriptions.push(countDebugSub);
      }
    });
    this.subscriptions.push(routeSub);

    // No need to subscribe to follow state since we're using it directly in template
    
    // Subscribe to current user changes and reload likes when user changes
    const userChangeSub = this.currentUser$.subscribe(user => {
      if (user?.uid && this.recipeId) {
        // User changed, reloading likes
        // Small delay to ensure previous requests complete
        setTimeout(() => {
          this.store.dispatch(LikesActions.checkIfLiked({ userId: user.uid, recipeId: this.recipeId }));
        }, 200);
      }
    });
    this.subscriptions.push(userChangeSub);

    // Handle recipe errors
    const recipeErrorSub = this.recipeError$.subscribe(error => {
      if (error) {
        this.snackBar.open(`${this.translate.instant('Error loading recipe')}: ${error}`, this.translate.instant('Close'), { duration: 3000 });
      }
    });
    this.subscriptions.push(recipeErrorSub);

    // Handle comment errors
    const commentErrorSub = this.commentsError$.subscribe(error => {
      if (error) {
        this.snackBar.open(`${this.translate.instant('Error loading comments')}: ${error}`, this.translate.instant('Close'), { duration: 3000 });
      }
    });
    this.subscriptions.push(commentErrorSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
   

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
    // Load like count and likes list first
    this.store.dispatch(LikesActions.loadRecipeLikeCount({ recipeId: this.recipeId }));
    this.store.dispatch(LikesActions.loadRecipeLikes({ recipeId: this.recipeId }));
    
    // Wait for current user to be available, then check if liked
    const loadLikesSub = this.currentUser$.pipe(
      filter(user => !!user?.uid), // Only proceed when user is available
      take(1)
    ).subscribe(user => {
      // Loading likes for user and recipe
      this.store.dispatch(LikesActions.checkIfLiked({ userId: user.uid, recipeId: this.recipeId }));
    });
    this.subscriptions.push(loadLikesSub);
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

    const followToggleSub = this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
      if (!currentUser || !currentUser.uid) {
        this.snackBar.open(this.translate.instant('Please Login to follow user!'), this.translate.instant('Close'), {
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        event.source.checked = !event.checked;
        return;
      }

      const recipeSub = this.recipe$.pipe(take(1)).subscribe((recipe: Recipe | null) => {
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
      this.subscriptions.push(recipeSub);
    });
    this.subscriptions.push(followToggleSub);
  }

  toggleLike(): void {
    const toggleLikeSub = this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user || !user.uid) {
        this.snackBar.open(this.translate.instant('Please Login to like recipe!'), this.translate.instant('Close'), {
          duration: 2000,
          panelClass: ['warning-snackbar']
        });
        return;
      }

      this.store.dispatch(LikesActions.toggleLike({
        userId: user.uid,
        recipeId: this.recipeId
      }));
    });
    this.subscriptions.push(toggleLikeSub);
  }

  onLoginRequired(): void {
    this.snackBar.open(this.translate.instant('Please Login to follow user!'), this.translate.instant('Close'), {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  onEditRecipe(): void {
    if (this.recipeId) {
      this.router.navigate(['/edit-recipe', this.recipeId]);
    }
  }

  // onDeleteRecipe(): void {
  //   if (this.recipeId && confirm('Are you sure you want to delete this recipe?')) {
  //     this.store.dispatch(RecipeActions.deleteRecipe({ id: this.recipeId, idToken: this.authState.idToken }));
  //     this.router.navigate(['/']);
  //   }
  // }

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

  /**
   * Get optimized video URL based on video type (Supabase, YouTube, Direct)
   */
  getVideoEmbedUrl(url: string): string {
    if (!url) return '';

    // Check if it's a Supabase Storage URL
    if (this.isSupabaseStorageUrl(url)) {
      return this.getSupabaseVideoUrl(url);
    }
    
    // Check if it's a YouTube URL
    if (this.isYouTubeUrl(url)) {
      return this.getYouTubeEmbedUrl(url);
    }
    
    // Check if it's a direct video file
    if (this.isDirectVideoUrl(url)) {
      return this.getDirectVideoUrl(url);
    }

    return url;
  }

  /**
   * Check if URL is from Supabase Storage
   */
  private isSupabaseStorageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('supabase.co') && 
             urlObj.pathname.includes('/storage/') &&
             this.isVideoFile(url);
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is a YouTube URL
   */
  private isYouTubeUrl(url: string): boolean {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  /**
   * Check if URL is a direct video file
   */
  private isDirectVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * Check if URL points to a video file
   */
  private isVideoFile(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  }

  /**
   * Get Supabase video URL (direct playback, no autoplay)
   */
  private getSupabaseVideoUrl(url: string): string {
    // Supabase video - return original URL for direct video playback
    return url;
  }

  /**
   * Get YouTube embed URL (iframe with autoplay=0)
   */
  private getYouTubeEmbedUrl(url: string): string {
    let videoId = '';

    // Handle different YouTube URL formats
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/v/')) {
      videoId = url.split('v/')[1]?.split('?')[0] || '';
    }

    // Clean video ID (remove any extra characters)
    if (videoId) {
      videoId = videoId.replace(/[^a-zA-Z0-9_-]/g, '');
    }

    if (videoId) {
      // YouTube embed URL with proper parameters
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&controls=1&loop=0&mute=0&showinfo=0&iv_load_policy=3`;
    }

    return url;
  }

  /**
   * Get direct video URL (native video element)
   */
  private getDirectVideoUrl(url: string): string {
    // Direct video file - return original URL for native video playback
    return url;
  }

  /**
   * Determine video element type based on URL
   */
  getVideoElementType(url: string): 'iframe' | 'video' {
    if (this.isYouTubeUrl(url)) {
      return 'iframe';
    }
    return 'video';
  }


  // Iframe event handlers
  onIframeLoad(): void {
    // YouTube iframe loaded successfully
  }

  onIframeError(): void {
    this.snackBar.open(this.translate.instant('Failed to load video. Please check the URL.'), this.translate.instant('Close'), {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  // TrackBy functions for virtual scrolling performance
  trackByIngredient(index: number, ingredient: string): string {
    return `${index}-${ingredient}`;
  }

  trackByStep(index: number, step: any): string {
    return step.id || `${index}-${step.description}`;
  }
}

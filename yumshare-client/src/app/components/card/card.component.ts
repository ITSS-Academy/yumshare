import {Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from "@angular/material/card";
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {ShareModule} from '../../shared/share.module';
import {CommonModule} from '@angular/common';
import {LazyImageDirective} from '../../directives/lazy-image/lazy-image.directive';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, combineLatest, BehaviorSubject, distinctUntilChanged, switchMap, map, startWith } from 'rxjs';
import * as FavoriteActions from '../../ngrx/favorite/favorite.actions';
import * as LikeActions from '../../ngrx/likes/likes.actions';
import { selectUserId } from '../../ngrx/auth/auth.selectors';
import { selectIsRecipeFavorite, selectIsToggleLoading, selectToggleError } from '../../ngrx/favorite/favorite.selectors';
import { selectRecipeLikeCount } from '../../ngrx/likes/likes.selectors';
// import {ResponsiveImageComponent} from '../responsive-image/responsive-image.component';
// import {LazyImageDirective} from '../../directives/lazy-image/lazy-image.directive';
// import {SlideInDirective} from '../../directives/animations/slide-in.directive';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-card',
  imports: [
    MatCard,
    MatCardActions,
    MatCardContent,
    MatSnackBarModule,
    ShareModule,
    CommonModule,
    LazyImageDirective,
    TranslatePipe,
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit, OnDestroy, OnChanges {
  @Input() cardData: any[] = [];
  @Input() layout: 'carousel' | 'grid' = 'carousel';
  
  // NgRx observables
  currentUserId$: Observable<string | undefined>;
  private destroy$ = new Subject<void>();
  
  // Reactive data streams - single source of truth
  private cardDataSubject = new BehaviorSubject<any[]>([]);
  private favoriteStatusSubject = new BehaviorSubject<{ [recipeId: string]: boolean }>({});
  private toggleLoadingSubject = new BehaviorSubject<{ [recipeId: string]: boolean }>({});
  private toggleErrorSubject = new BehaviorSubject<{ [recipeId: string]: string | null }>({});
  private likeCountsSubject = new BehaviorSubject<{ [recipeId: string]: number }>({});
  
  // Public observables for template
  favoriteStatus$ = this.favoriteStatusSubject.asObservable();
  toggleLoading$ = this.toggleLoadingSubject.asObservable();
  toggleError$ = this.toggleErrorSubject.asObservable();
  likeCounts$ = this.likeCountsSubject.asObservable();
  
  // Current user ID for actions
  private currentUserId: string | undefined;

  constructor(
    private router: Router,
    private store: Store,
    private snackBar: MatSnackBar
  ) {
    this.currentUserId$ = this.store.select(selectUserId);
    this.setupOptimizedSubscriptions();
  }

  ngOnInit() {
    // Initialize with current cardData
    this.cardDataSubject.next(this.cardData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cardData'] && changes['cardData'].currentValue) {
      this.cardDataSubject.next(this.cardData);
    }
  }

  /**
   * Setup optimized subscriptions - SINGLE subscription pattern
   * This eliminates N+1 subscription problem and memory leaks
   */
  private setupOptimizedSubscriptions() {
    // 1. Subscribe to current user ID once
    this.currentUserId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(userId => {
        this.currentUserId = userId;
      });

    // 2. Main subscription that handles all recipe data changes
    combineLatest([
      this.cardDataSubject.asObservable(),
      this.currentUserId$
    ]    ).pipe(
      takeUntil(this.destroy$),
      // Remove distinctUntilChanged to ensure all updates are processed
      // distinctUntilChanged((prev, curr) => 
      //   JSON.stringify(prev[0]) === JSON.stringify(curr[0]) && prev[1] === curr[1]
      // ),
      switchMap(([cardData, userId]) => {
        if (!cardData || cardData.length === 0) {
          return [];
        }

        const recipeIds = cardData
          .filter(item => item.id)
          .map(item => item.id);

        if (recipeIds.length === 0) {
          return [];
        }

        // Initialize default values
        this.initializeDefaultValues(recipeIds);

        // Load data for all recipes
        if (userId) {
          this.store.dispatch(FavoriteActions.loadFavoritesForRecipes({
            userId: userId,
            recipeIds: recipeIds
          }));
        }

        // Load like counts
        recipeIds.forEach(recipeId => {
          this.store.dispatch(LikeActions.loadRecipeLikeCount({ recipeId }));
        });

        // Return combined observables for all recipes
        return combineLatest(
          recipeIds.map(recipeId => 
            combineLatest([
              this.store.select(selectIsRecipeFavorite(recipeId)),
              this.store.select(selectIsToggleLoading(recipeId)),
              this.store.select(selectToggleError(recipeId)),
              this.store.select(selectRecipeLikeCount(recipeId))
            ]).pipe(
              map(([isFavorite, isLoading, error, likeCount]) => ({
                recipeId,
                isFavorite,
                isLoading,
                error,
                likeCount
              }))
            )
          )
        );
      })
    ).subscribe(recipeData => {
      // Update all subjects with new data
      const favoriteStatus: { [recipeId: string]: boolean } = {};
      const toggleLoading: { [recipeId: string]: boolean } = {};
      const toggleError: { [recipeId: string]: string | null } = {};
      const likeCounts: { [recipeId: string]: number } = {};

      recipeData.forEach(data => {
        favoriteStatus[data.recipeId] = data.isFavorite;
        toggleLoading[data.recipeId] = data.isLoading;
        toggleError[data.recipeId] = data.error;
        likeCounts[data.recipeId] = data.likeCount;
      });

      this.favoriteStatusSubject.next(favoriteStatus);
      this.toggleLoadingSubject.next(toggleLoading);
      this.toggleErrorSubject.next(toggleError);
      this.likeCountsSubject.next(likeCounts);
    });
  }

  private initializeDefaultValues(recipeIds: string[]) {
    const currentFavoriteStatus = this.favoriteStatusSubject.value;
    const currentToggleLoading = this.toggleLoadingSubject.value;
    const currentToggleError = this.toggleErrorSubject.value;
    const currentLikeCounts = this.likeCountsSubject.value;

    recipeIds.forEach(recipeId => {
      if (!(recipeId in currentFavoriteStatus)) {
        currentFavoriteStatus[recipeId] = false;
      }
      if (!(recipeId in currentToggleLoading)) {
        currentToggleLoading[recipeId] = false;
      }
      if (!(recipeId in currentToggleError)) {
        currentToggleError[recipeId] = null;
      }
      if (!(recipeId in currentLikeCounts)) {
        currentLikeCounts[recipeId] = 0;
      }
    });

    this.favoriteStatusSubject.next(currentFavoriteStatus);
    this.toggleLoadingSubject.next(currentToggleLoading);
    this.toggleErrorSubject.next(currentToggleError);
    this.likeCountsSubject.next(currentLikeCounts);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Complete all subjects
    this.cardDataSubject.complete();
    this.favoriteStatusSubject.complete();
    this.toggleLoadingSubject.complete();
    this.toggleErrorSubject.complete();
    this.likeCountsSubject.complete();
  }

  // ❤️ toggle favorite using NgRx - OPTIMIZED
  toggleFavorite(item: any) {
    if (!item.id) {
      console.error('Recipe ID is required for favorite toggle');
      return;
    }

    // Prevent multiple clicks while loading
    if (this.isToggleLoading(item.id)) {
      return; // Toggle already in progress
    }

    // Use cached user ID instead of creating new subscription
    if (!this.currentUserId) {
      this.showLoginPrompt();
      return;
    }
    // Dispatch toggle favorite action
    this.store.dispatch(FavoriteActions.toggleFavorite({
      userId: this.currentUserId,
      recipeId: item.id
    }));
  }

  // Show login prompt when user is not logged in
  private showLoginPrompt() {
    const message = 'You need to login to add dishes to your favorites list!';
    
    // Show snackbar with action button (giống như trong comment component)
    this.snackBar.open(message, 'Login', {
      duration: 4000,
      panelClass: ['warning-snackbar']
    });
  }

  // Check if recipe is favorite - OPTIMIZED
  isFavorite(recipeId: string): boolean {
    return this.favoriteStatusSubject.value[recipeId] || false;
  }

  // Check if toggle is loading for specific recipe - OPTIMIZED
  isToggleLoading(recipeId: string): boolean {
    return this.toggleLoadingSubject.value[recipeId] || false;
  }

  // Get toggle error for specific recipe - OPTIMIZED
  getToggleError(recipeId: string): string | null {
    return this.toggleErrorSubject.value[recipeId] || null;
  }

  // Clear toggle error for specific recipe
  clearToggleError(recipeId: string) {
    this.store.dispatch(FavoriteActions.clearToggleError({ recipeId }));
  }

  // Get favorite button tooltip text
  getFavoriteTooltip(recipeId: string): string {
    if (this.getToggleError(recipeId)) {
      return this.getToggleError(recipeId)!;
    }
    
    if (this.isToggleLoading(recipeId)) {
      return 'Loading...';
    }

    // For now, we'll show the login message in tooltip
    // The actual login check happens in toggleFavorite method
    return this.isFavorite(recipeId) ? 'Remove from favorites' : 'Add to favorites';
  }

  // Chia sẻ món ăn
  shareRecipe(item: any) {
    const url = `${window.location.origin}/recipe-detail/${item.id}`;
    const title = item.title || 'YumShare Recipe';
    const text = `Check out this recipe: ${title}`;
    if (navigator.share) {
      navigator.share({ title, text, url })
        .catch(err => {
          // Share failed - could show toast notification
        });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  }

  navigationToDetail(id: string) {
    this.router.navigate(['/recipe-detail', id]).then();
  }

  getDifficultyLabel(difficulty: any): string {
  if (difficulty === 1 || difficulty === '1' || difficulty?.toLowerCase?.() === 'easy') return 'Easy';
  if (difficulty === 2 || difficulty === '2' || difficulty?.toLowerCase?.() === 'medium') return 'Medium';
  if (difficulty === 3 || difficulty === '3' || difficulty?.toLowerCase?.() === 'hard') return 'Hard';
  return difficulty || 'Unknown';
}
  getDifficultyClass(difficulty: any): string {
  if (difficulty === 1 || difficulty === '1' || difficulty?.toLowerCase?.() === 'easy') return 'easy';
  if (difficulty === 2 || difficulty === '2' || difficulty?.toLowerCase?.() === 'medium') return 'medium';
  if (difficulty === 3 || difficulty === '3' || difficulty?.toLowerCase?.() === 'hard') return 'hard';
  return '';
}

  // Get like count for specific recipe - OPTIMIZED
  getLikeCount(recipeId: string): number {
    return this.likeCountsSubject.value[recipeId] || 0;
  }
}

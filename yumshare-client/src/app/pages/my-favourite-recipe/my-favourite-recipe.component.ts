import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, Subject } from 'rxjs';
import { map, filter, startWith } from 'rxjs/operators';

// Material UI imports
import { MatButton, MatIconButton, MatMiniFabButton } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';

// NgRx imports
import * as FavoriteActions from '../../ngrx/favorite/favorite.actions';
import * as FavoriteSelectors from '../../ngrx/favorite/favorite.selectors';
import * as AuthSelectors from '../../ngrx/auth/auth.selectors';
import * as CategorySelectors from '../../ngrx/category/category.selectors';

// Models
import { Favorite } from '../../models/favorite.model';
import { Recipe } from '../../models/recipe.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-my-favourite-recipe',
  imports: [
    CommonModule,
    FormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatMenu,
    MatButton,
    MatMenuTrigger,
    MatMenuItem,
    MatIcon,
    MatIconButton,
    MatMiniFabButton,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe,
    ScrollingModule,
  ],
  templateUrl: './my-favourite-recipe.component.html',
  styleUrl: './my-favourite-recipe.component.scss'
})
export class MyFavouriteRecipeComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);
  private subscriptions: Subscription[] = [];
  private filterTrigger$ = new Subject<void>();

  // Pagination properties
  pageIndex = 0;
  pageSize = 6;
  
  // Virtual scrolling properties
  itemSize = 200; // Height of each favorite card

  // Filter properties
  selectedCategory: string = 'Category';
  selectedDifficulty: string = 'Difficulty';
  selectedCategoryId: string | null = null;
  
  // Current filter state
  currentFilters: any = {};

  // Observable properties from NgRx
  favorites$: Observable<Favorite[]>;
  paginatedFavorites$: Observable<PaginatedResponse<Favorite> | null>;
  favoritesLoading$: Observable<boolean>;
  favoritesError$: Observable<string | null>;
  favoriteCount$: Observable<number>;
  currentUserId$: Observable<string | null>;
  isAuthenticated$: Observable<boolean>;
  
  // Category observables
  activeCategories$: Observable<Category[]>;

  // Computed observables
  displayedRecipes$: Observable<Favorite[]>;
  totalPages$: Observable<number>;
  pageNumbers$: Observable<number[]>;
  hasFavorites$: Observable<boolean>;
  isEmpty$: Observable<boolean>;

  constructor() {
    // Initialize observables
    this.favorites$ = this.store.select(FavoriteSelectors.selectFavorites);
    this.paginatedFavorites$ = this.store.select(FavoriteSelectors.selectPaginatedFavorites);
    this.favoritesLoading$ = this.store.select(FavoriteSelectors.selectFavoritesLoading);
    this.favoritesError$ = this.store.select(FavoriteSelectors.selectFavoritesError);
    this.favoriteCount$ = this.store.select(FavoriteSelectors.selectFavoriteCount);
    this.currentUserId$ = this.store.select(FavoriteSelectors.selectCurrentUserId);
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
    
    // Category observables
    this.activeCategories$ = this.store.select(CategorySelectors.selectActiveCategories);

    // Computed observables - now using server-side data
    this.displayedRecipes$ = this.favorites$;

    this.totalPages$ = this.paginatedFavorites$.pipe(
      map(paginatedData => paginatedData ? Math.ceil(paginatedData.total / this.pageSize) : 0)
    );

    this.pageNumbers$ = combineLatest([
      this.totalPages$,
      this.paginatedFavorites$
    ]).pipe(
      map(([totalPages]) => {
        const current = this.pageIndex;
        const delta = 2;
        const range: number[] = [];
        let left = Math.max(0, current - delta);
        let right = Math.min(totalPages - 1, current + delta);

        if (current <= delta) {
          right = Math.min(totalPages - 1, 2 * delta);
        }
        if (current >= totalPages - 1 - delta) {
          left = Math.max(0, totalPages - 1 - 2 * delta);
        }

        for (let i = left; i <= right; i++) {
          range.push(i);
        }
        return range;
      })
    );

    this.hasFavorites$ = this.store.select(FavoriteSelectors.selectHasFavorites);
    this.isEmpty$ = combineLatest([
      this.favoritesLoading$,
      this.favorites$
    ]).pipe(
      map(([loading, favorites]) => !loading && favorites.length === 0)
    );
  }

  ngOnInit() {
    // Load active categories
    this.store.dispatch({ type: '[Category] Load Active Categories' });

    // Debug: Log current user ID
    this.subscriptions.push(
      this.currentUserId$.subscribe(userId => {
        console.log('Current User ID:', userId);
      })
    );

    // Debug: Log auth state
    this.subscriptions.push(
      this.isAuthenticated$.subscribe(isAuth => {
        console.log('Is Authenticated:', isAuth);
      })
    );

    // Get user ID from auth state and set it in favorite state
    this.subscriptions.push(
      this.store.select(AuthSelectors.selectUserId)
        .pipe(filter(userId => !!userId))
        .subscribe(userId => {
          console.log('Setting current user ID in favorite state:', userId);
          this.store.dispatch(FavoriteActions.setCurrentUser({ userId: userId! }));
        })
    );

    // Load user favorites when component initializes
    this.subscriptions.push(
      this.currentUserId$
        .pipe(filter(userId => !!userId))
        .subscribe(userId => {
          console.log('Loading favorites for user:', userId);
          this.loadUserFavorites(userId!, this.currentFilters);
        })
    );

    // Debug: Log favorites data
    this.subscriptions.push(
      this.favorites$.subscribe(favorites => {
        console.log('Favorites data:', favorites);
      })
    );

    // Debug: Log loading state
    this.subscriptions.push(
      this.favoritesLoading$.subscribe(loading => {
        console.log('Favorites loading:', loading);
      })
    );

    // Handle errors
    this.subscriptions.push(
      this.favoritesError$
        .pipe(filter(error => !!error))
        .subscribe(error => {
          console.error('Favorites error:', error);
          this.snackBar.open(`Lỗi: ${error}`, 'Đóng', { duration: 5000 });
        })
    );

    // Restore page index from session storage
    const savedPageIndex = sessionStorage.getItem('myFavouriteRecipePageIndex');
    if (savedPageIndex !== null) {
      this.pageIndex = parseInt(savedPageIndex);
      sessionStorage.removeItem('myFavouriteRecipePageIndex');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this.filterTrigger$.complete();
  }

  private loadUserFavorites(userId: string, filters?: any) {
    const queryOptions: any = {
      page: this.pageIndex + 1, // Server-side pagination
      size: this.pageSize,
      orderBy: 'created_at',
      order: 'DESC',
      ...filters // Include any filters
    };

    console.log('Dispatching loadUserFavorites action with:', {
      userId,
      queryOptions
    });
    
    this.store.dispatch(FavoriteActions.loadUserFavorites({
      userId,
      queryOptions
    }));
  }

  setCategory(category: Category) {
    this.selectedCategory = category.name;
    this.selectedCategoryId = category.id;
    this.pageIndex = 0; // Reset to first page when filtering
    
    // Update current filters
    this.currentFilters = {
      ...this.currentFilters,
      category: category.id
    };
    
    // Reload data with new filters
    this.reloadWithFilters();
  }

  clearCategoryFilter() {
    this.selectedCategory = 'Category';
    this.selectedCategoryId = null;
    this.pageIndex = 0; // Reset to first page when clearing filter
    
    // Remove category from filters
    const { category, ...restFilters } = this.currentFilters;
    this.currentFilters = restFilters;
    
    // Reload data with updated filters
    this.reloadWithFilters();
  }

  setDifficulty(option: string) {
    this.selectedDifficulty = option;
    this.pageIndex = 0; // Reset to first page when filtering
    
    // Update current filters
    this.currentFilters = {
      ...this.currentFilters,
      difficulty: option !== 'Difficulty' ? option : undefined
    };
    
    // Reload data with new filters
    this.reloadWithFilters();
  }

  clearDifficultyFilter() {
    this.selectedDifficulty = 'Difficulty';
    this.pageIndex = 0; // Reset to first page when clearing filter
    
    // Remove difficulty from filters
    const { difficulty, ...restFilters } = this.currentFilters;
    this.currentFilters = restFilters;
    
    // Reload data with updated filters
    this.reloadWithFilters();
  }

  goToPage(page: number) {
    this.subscriptions.push(
      this.totalPages$.subscribe(totalPages => {
        if (page >= 0 && page < totalPages) {
          this.pageIndex = page;
          this.reloadWithFilters();
        }
      })
    );
  }

  goToFirst() {
    this.pageIndex = 0;
    this.reloadWithFilters();
  }

  goToLast() {
    this.subscriptions.push(
      this.totalPages$.subscribe(totalPages => {
        this.pageIndex = totalPages - 1;
        this.reloadWithFilters();
      })
    );
  }

  goToPrev() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.reloadWithFilters();
    }
  }

  goToNext() {
    this.subscriptions.push(
      this.totalPages$.subscribe(totalPages => {
        if (this.pageIndex < totalPages - 1) {
          this.pageIndex++;
          this.reloadWithFilters();
        }
      })
    );
  }

  toggleFavourite(recipe: Favorite) {
    this.subscriptions.push(
      this.currentUserId$
        .pipe(filter(userId => !!userId))
        .subscribe(userId => {
          this.store.dispatch(FavoriteActions.toggleFavorite({
            userId: userId!,
            recipeId: recipe.recipe_id
          }));
        })
    );
  }

  private reloadWithFilters() {
    this.subscriptions.push(
      this.currentUserId$
        .pipe(filter(userId => !!userId))
        .subscribe(userId => {
          this.loadUserFavorites(userId!, this.currentFilters);
        })
    );
    
    sessionStorage.setItem('myFavouriteRecipePageIndex', this.pageIndex.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // TrackBy function for virtual scrolling performance
  trackByFavoriteId(index: number, favorite: Favorite): string {
    return favorite.id;
  }
}

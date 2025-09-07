import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest, debounceTime, distinctUntilChanged, takeUntil, startWith, map, Subscription } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeService } from '../../services/recipe/recipe.service';
import * as RecipeActions from '../../ngrx/recipe/recipe.actions';
import { selectSearchResults, selectSearchLoading, selectSearchError, selectRecipeState, selectSearchQuery, selectAllRecipes, selectRecipesLoading, selectRecipesError, selectPaginatedRecipes, selectPaginatedRecipesLoading, selectPaginatedRecipesError } from '../../ngrx/recipe/recipe.selectors';
import { AsyncPipe, CommonModule, LowerCasePipe, NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatProgressSpinnerModule,
    LowerCasePipe,
    AsyncPipe,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  keyword: string = '';
  selectedCategory: string = '';
  categories: Category[] = [];
  
  // NgRx observables
  searchResults$: Observable<Recipe[]>;
  searchLoading$: Observable<boolean>;
  searchError$: Observable<string | null>;
  recipeState$: Observable<any>;
  searchQuery$: Observable<string>;
  allRecipes$: Observable<Recipe[]>;
  recipesLoading$: Observable<boolean>;
  recipesError$: Observable<string | null>;
  paginatedRecipes$: Observable<any>;
  paginatedRecipesLoading$: Observable<boolean>;
  paginatedRecipesError$: Observable<string | null>;
  
  // Reactive search subjects
  private searchSubject = new Subject<string>();
  private categorySubject = new Subject<string>();
  private pageSubject = new Subject<number>();
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];
  
  // Pagination
  pageSize = 8;
  currentPage = 1;
  totalPages = 0;
  visiblePages: number[] = [];
  showEllipsis = false;
  displayedResults$: Observable<Recipe[]>;

  constructor(
    private store: Store,
    private router: Router,
    private recipeService: RecipeService
  ) {
    this.searchResults$ = this.store.select(selectSearchResults);
    this.searchLoading$ = this.store.select(selectSearchLoading);
    this.searchError$ = this.store.select(selectSearchError);
    this.searchQuery$ = this.store.select(selectSearchQuery);
    this.recipeState$ = this.store.select(selectRecipeState);
    this.allRecipes$ = this.store.select(selectAllRecipes);
    this.recipesLoading$ = this.store.select(selectRecipesLoading);
    this.recipesError$ = this.store.select(selectRecipesError);
    this.paginatedRecipes$ = this.store.select(selectPaginatedRecipes);
    this.paginatedRecipesLoading$ = this.store.select(selectPaginatedRecipesLoading);
    this.paginatedRecipesError$ = this.store.select(selectPaginatedRecipesError);
    
    // Create displayed results observable that uses paginated results from backend
    this.displayedResults$ = combineLatest([
      this.paginatedRecipes$,
      this.searchResults$,
      this.allRecipes$
    ]).pipe(
      map(([paginatedRecipes, searchResults, allRecipes]) => {
        if (paginatedRecipes) {
          // Use paginated results from backend
          this.currentPage = paginatedRecipes.current_page;
          this.totalPages = paginatedRecipes.total_pages;
          this.updateVisiblePages();
          
          
          return paginatedRecipes.data;
        } else if (searchResults.length > 0) {
          // Fallback to search results
          this.currentPage = 1;
          this.totalPages = 1;
          this.updateVisiblePages();
          
          
          return searchResults;
        } else {
          // Fallback to all recipes (initial state)
          this.currentPage = 1;
          this.totalPages = 1;
          this.updateVisiblePages();
          
          
          return allRecipes;
        }
      })
    );
  }

  ngOnInit() {
    // Load all recipes initially with pagination
    this.store.dispatch(RecipeActions.loadPaginatedRecipes({
      page: 1,
      size: this.pageSize,
      orderBy: 'created_at',
      order: 'DESC'
    }));

    // Load categories from RecipeService
    this.subscriptions.push(
      this.recipeService.getCategories().subscribe({
        next: (response: any) => {
          this.categories = response.data;
        },
        error: (error: any) => console.error('Error loading categories:', error),
      })
    );


    // Setup reactive search with debouncing
    this.setupReactiveSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
    this.store.dispatch(RecipeActions.clearSearchResults());
  }

  private setupReactiveSearch() {
    // Remove automatic search on input changes
    // Only search when explicitly triggered by user actions

    // Subscribe to search errors for better error handling
    this.subscriptions.push(
      this.searchError$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(error => {
        if (error) {
          console.error('Search error:', error);
          // You can add toast notification or other error handling here
        }
      })
    );

    // Subscribe to search loading state
    this.subscriptions.push(
      this.searchLoading$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(loading => {
        if (loading) {
          console.log('Search in progress...');
        }
      })
    );
  }

  updateVisiblePages() {
    const maxVisible = 3;
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    this.visiblePages = [];
    for (let i = start; i <= end; i++) {
      this.visiblePages.push(i);
    }
    this.showEllipsis = this.totalPages > end;
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.performSearch(false); // Don't reset page when paginating
  }

  prevPage() {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
  }

  onSearch() {
    this.performSearch();
  }

  onKeywordChange() {
    // Remove automatic search - only update the keyword value
    // Search will be triggered only when user clicks Search button
  }

  onCategoryChange() {
    // Remove automatic search - only update the category value
    // Search will be triggered only when user clicks Search button
  }

  private performSearch(resetPage: boolean = true) {
    // Reset to first page when performing new search (not when paginating)
    if (resetPage) {
      this.currentPage = 1;
    }
    
    // Check if keyword starts with "author:" to search by author
    let query = this.keyword;
    let author = '';
    
    if (this.keyword.toLowerCase().startsWith('author:')) {
      // Extract author name after "author:" 
      author = this.keyword.substring(7).trim();
      query = ''; // Clear query when searching by author
    }
    
    this.store.dispatch(
      RecipeActions.searchRecipes({
        query: query,
        category: this.selectedCategory,
        author: author,
        page: this.currentPage,
        size: this.pageSize,
        orderBy: 'created_at',
        order: 'DESC'
      })
    );
  }

  clearSearch() {
    // Reset form fields
    this.keyword = '';
    this.selectedCategory = '';
    
    // Reset pagination
    this.currentPage = 1;
    this.totalPages = 0;
    this.visiblePages = [];
    this.showEllipsis = false;
    
    // Clear search results first
    this.store.dispatch(RecipeActions.clearSearchResults());
    
    // Then reload all recipes with pagination to get back to initial state
    setTimeout(() => {
      this.store.dispatch(RecipeActions.loadPaginatedRecipes({
        page: 1,
        size: this.pageSize,
        orderBy: 'created_at',
        order: 'DESC'
      }));
    }, 100);
  }

  loadInitialRecipes() {
    this.store.dispatch(RecipeActions.loadPaginatedRecipes({
      page: 1,
      size: this.pageSize,
      orderBy: 'created_at',
      order: 'DESC'
    }));
  }

  // Get loading state
  getLoadingState() {
    return combineLatest([
      this.searchLoading$,
      this.recipesLoading$
    ]).pipe(
      map(([searchLoading, recipesLoading]) => searchLoading || recipesLoading)
    );
  }

  // Get search statistics
  getSearchStats() {
    return combineLatest([
      this.paginatedRecipes$,
      this.searchResults$,
      this.allRecipes$,
      this.searchQuery$,
      this.searchLoading$,
      this.searchError$
    ]).pipe(
      map(([paginatedRecipes, searchResults, allRecipes, query, loading, error]) => {
        if (paginatedRecipes) {
          return {
            totalResults: paginatedRecipes.total,
            currentQuery: query,
            isLoading: loading,
            hasError: !!error,
            errorMessage: error,
            currentPage: paginatedRecipes.current_page,
            totalPages: paginatedRecipes.total_pages
          };
        } else {
          const results = searchResults.length > 0 ? searchResults : allRecipes;
          return {
            totalResults: results.length,
            currentQuery: searchResults.length > 0 ? query : '', // Only show query if we have search results
            isLoading: loading,
            hasError: !!error,
            errorMessage: error,
            currentPage: 1,
            totalPages: 1
          };
        }
      })
    );
  }

  toggleFavorite(recipe: Recipe) {
    // TODO: Dispatch action để cập nhật trạng thái yêu thích
  }

  shareRecipe(recipe: Recipe) {
    console.log(`Sharing recipe: ${recipe.title}`);
  }

  viewRecipe(recipeId: string) {
    this.store.dispatch(RecipeActions.loadRecipeById({ id: recipeId }));
    this.router.navigate(['/recipe-detail', recipeId]);
  }
}

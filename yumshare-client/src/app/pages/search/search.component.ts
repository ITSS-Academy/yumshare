import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Observable, Subject, combineLatest, debounceTime, distinctUntilChanged, takeUntil, startWith, map } from 'rxjs';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeService } from '../../services/recipe/recipe.service';
import * as RecipeActions from '../../ngrx/recipe/recipe.actions';
import { selectSearchResults, selectSearchLoading, selectSearchError, selectRecipeState, selectSearchQuery, selectAllRecipes, selectRecipesLoading, selectRecipesError } from '../../ngrx/recipe/recipe.selectors';
import { AsyncPipe, LowerCasePipe, NgClass, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
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
  
  // Reactive search subjects
  private searchSubject = new Subject<string>();
  private categorySubject = new Subject<string>();
  private pageSubject = new Subject<number>();
  private destroy$ = new Subject<void>();
  
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
    
    // Create displayed results observable that combines search results with pagination
    // If no search results, show all recipes
    this.displayedResults$ = combineLatest([
      this.searchResults$,
      this.allRecipes$,
      this.pageSubject.pipe(startWith(1))
    ]).pipe(
      map(([searchResults, allRecipes, page]) => {
        // Use search results if available, otherwise use all recipes
        const results = searchResults.length > 0 ? searchResults : allRecipes;
        this.currentPage = page;
        this.totalPages = Math.ceil(results.length / this.pageSize);
        this.updateVisiblePages();
        const start = (page - 1) * this.pageSize;
        const end = start + this.pageSize;
        return results.slice(start, end);
      })
    );
  }

  ngOnInit() {
    // Load all recipes initially
    this.store.dispatch(RecipeActions.loadAllRecipes());

    // Load categories from RecipeService
    this.recipeService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data;
      },
      error: (error) => console.error('Error loading categories:', error),
    });

    // Setup reactive search with debouncing
    this.setupReactiveSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupReactiveSearch() {
    // Debounced search for keyword changes
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performSearch();
    });

    // Immediate search for category changes
    this.categorySubject.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.performSearch();
    });

    // Subscribe to search errors for better error handling
    this.searchError$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(error => {
      if (error) {
        console.error('Search error:', error);
        // You can add toast notification or other error handling here
      }
    });

    // Subscribe to search loading state
    this.searchLoading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      if (loading) {
        console.log('Search in progress...');
      }
    });
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
    this.pageSubject.next(page);
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
    this.searchSubject.next(this.keyword);
  }

  onCategoryChange() {
    this.categorySubject.next(this.selectedCategory);
  }

  private performSearch() {
    this.store.dispatch(
      RecipeActions.searchRecipes({
        query: this.keyword,
        category: this.selectedCategory,
        author: '',
      })
    );
  }

  clearSearch() {
    this.keyword = '';
    this.selectedCategory = '';
    this.store.dispatch(RecipeActions.clearSearchResults());
  }

  loadInitialRecipes() {
    this.store.dispatch(RecipeActions.loadAllRecipes());
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
      this.searchResults$,
      this.allRecipes$,
      this.searchQuery$,
      this.searchLoading$,
      this.searchError$
    ]).pipe(
      map(([searchResults, allRecipes, query, loading, error]) => {
        // Use search results if available, otherwise use all recipes
        const results = searchResults.length > 0 ? searchResults : allRecipes;
        return {
          totalResults: results.length,
          currentQuery: query,
          isLoading: loading,
          hasError: !!error,
          errorMessage: error
        };
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
    this.router.navigate(['/recipes', recipeId]);
  }
}

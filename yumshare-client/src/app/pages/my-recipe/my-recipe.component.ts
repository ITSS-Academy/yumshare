import { Component, OnInit, OnDestroy, inject, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map, filter, startWith, take } from 'rxjs/operators';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

// Material UI imports
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Router } from '@angular/router';

// NgRx imports
import * as RecipeActions from '../../ngrx/recipe/recipe.actions';
import * as RecipeSelectors from '../../ngrx/recipe/recipe.selectors';
import * as AuthSelectors from '../../ngrx/auth/auth.selectors';
import * as CategorySelectors from '../../ngrx/category/category.selectors';

// Models
import { Recipe } from '../../models/recipe.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { Category } from '../../models/category.model';
@Component({
  selector: 'app-my-recipe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    ScrollingModule,
  ],
  templateUrl: './my-recipe.component.html',
  styleUrl: './my-recipe.component.scss'
})
export class MyRecipeComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private subscriptions: Subscription[] = [];

  // Public router for template access
  router = inject(Router);

  // ViewChild for scrolling
  @ViewChild('contentContainer', { static: false }) contentContainer!: ElementRef;

  // Pagination properties
  pageIndex = 0;
  pageSize = 6;
  currentPage = 1;
  totalPages = 0;
  visiblePages: number[] = [];
  showEllipsis = false;
  
  // Virtual scrolling properties
  itemSize = 300; // Height of each recipe card

  // Filter properties
  selectedCategory: string = 'Category';
  selectedDifficulty: string = 'Difficulty';
  selectedCategoryId: string | null = null;
  
  // Current filter state
  currentFilters: any = {};

  // Observable properties from NgRx
  recipes$: Observable<Recipe[]>;
  paginatedRecipes$: Observable<PaginatedResponse<Recipe> | null>;
  recipesLoading$: Observable<boolean>;
  recipesError$: Observable<string | null>;
  currentUserId$: Observable<string | null>;
  isAuthenticated$: Observable<boolean>;
  
  // Category observables
  activeCategories$: Observable<Category[]>;

  // Computed observables
  displayedRecipes$: Observable<Recipe[]>;
  totalPages$: Observable<number>;
  pageNumbers$: Observable<number[]>;
  hasRecipes$: Observable<boolean>;
  isEmpty$: Observable<boolean>;

  constructor() {
    // Initialize observables
    this.recipes$ = this.store.select(RecipeSelectors.selectAllRecipes);
    this.paginatedRecipes$ = this.store.select(RecipeSelectors.selectPaginatedRecipes);
    this.recipesLoading$ = this.store.select(RecipeSelectors.selectRecipeLoading);
    this.recipesError$ = this.store.select(RecipeSelectors.selectRecipeError);
    this.currentUserId$ = this.store.select(AuthSelectors.selectUserId);
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
    
    // Category observables
    this.activeCategories$ = this.store.select(CategorySelectors.selectActiveCategories);

    // Computed observables - using server-side data
    this.displayedRecipes$ = this.recipes$;

    this.totalPages$ = this.paginatedRecipes$.pipe(
      map(paginatedData => {
        const total = paginatedData ? Math.ceil(paginatedData.total / this.pageSize) : 0;
        this.totalPages = total;
        this.updateVisiblePages();
        return total;
      })
    );

    this.pageNumbers$ = combineLatest([
      this.totalPages$,
      this.paginatedRecipes$
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

    this.hasRecipes$ = this.recipes$.pipe(
      map(recipes => recipes.length > 0)
    );

    this.isEmpty$ = combineLatest([
      this.recipesLoading$,
      this.recipes$
    ]).pipe(
      map(([loading, recipes]) => !loading && recipes.length === 0)
    );
  }

  ngOnInit() {
    // Load active categories
    this.store.dispatch({ type: '[Category] Load Active Categories' });

    // Debug: Log current user ID
    this.subscriptions.push(
      this.currentUserId$.subscribe(userId => {
        // Current User ID loaded
      })
    );

    // Debug: Log auth state
    this.subscriptions.push(
      this.isAuthenticated$.subscribe(isAuth => {
        // Authentication status checked
      })
    );

    // Load user recipes when component initializes
    this.subscriptions.push(
      this.currentUserId$
        .pipe(filter(userId => !!userId))
        .subscribe(userId => {
          // Loading recipes for user
          this.loadUserRecipes(userId!, this.currentFilters);
        })
    );

    // Debug: Log recipes data
    this.subscriptions.push(
      this.recipes$.subscribe(recipes => {
        // Recipes data loaded
      })
    );

    // Debug: Log loading state
    this.subscriptions.push(
      this.recipesLoading$.subscribe(loading => {
        console.log('Recipes loading:', loading);
      })
    );

    // Handle errors
    this.subscriptions.push(
      this.recipesError$
        .pipe(filter(error => !!error))
        .subscribe(error => {
          console.error('Recipes error:', error);
          this.snackBar.open(`${this.translate.instant('Error:')} ${error}`, this.translate.instant('Close'), { duration: 5000 });
        })
    );

    // Restore page index from session storage
    const savedPageIndex = sessionStorage.getItem('myRecipePageIndex');
    if (savedPageIndex !== null) {
      this.pageIndex = parseInt(savedPageIndex);
      sessionStorage.removeItem('myRecipePageIndex');
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.subscriptions = [];
  }

  private loadUserRecipes(userId: string, filters?: any) {
    const queryOptions: any = {
      page: this.pageIndex + 1, // Server-side pagination
      size: this.pageSize,
      orderBy: 'created_at',
      order: 'DESC',
      author: userId, // Filter by current user
      ...filters // Include any filters
    };

    console.log('Dispatching loadRecipesByUser action with:', {
      userId,
      queryOptions
    });
    
    this.store.dispatch(RecipeActions.loadRecipesByUser({
      userId,
      queryOptions
    }));
  }

  setCategory(category: Category) {
    this.selectedCategory = category.name;
    this.selectedCategoryId = category.id;
    this.pageIndex = 0; // Reset to first page when filtering
    this.currentPage = 1; // Reset to first page when filtering
    
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
    this.currentPage = 1; // Reset to first page when clearing filter
    
    // Remove category from filters
    const { category, ...restFilters } = this.currentFilters;
    this.currentFilters = restFilters;
    
    // Reload data with updated filters
    this.reloadWithFilters();
  }

  setDifficulty(option: string) {
    this.selectedDifficulty = option;
    this.pageIndex = 0; // Reset to first page when filtering
    this.currentPage = 1; // Reset to first page when filtering
    
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
    this.currentPage = 1; // Reset to first page when clearing filter
    
    // Remove difficulty from filters
    const { difficulty, ...restFilters } = this.currentFilters;
    this.currentFilters = restFilters;
    
    // Reload data with updated filters
    this.reloadWithFilters();
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
    this.pageIndex = page - 1; // Convert to 0-based index
    this.reloadWithFilters();
    // Delay scroll to ensure DOM is updated
    setTimeout(() => {
      this.scrollToTop();
    }, 200);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  private scrollToTop() {
    // Method 1: Use ViewChild (most reliable)
    if (this.contentContainer) {
      this.contentContainer.nativeElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      return;
    }
    
    // Method 2: Scroll to specific element
    const contentContainer = document.querySelector('.content-container');
    if (contentContainer) {
      contentContainer.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      return;
    }
    
    // Method 3: Modern smooth scrolling
    try {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    } catch (error) {
      // Method 4: Fallback for older browsers
      window.scrollTo(0, 0);
    }
    
    // Method 5: Alternative using document.documentElement
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 100);
  }

  onEditRecipe(recipe: Recipe) {
    this.router.navigate(['/edit-recipe', recipe.id]);
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/recipe-detail', recipeId]);
  }

  editRecipe(recipeId: string) {
    this.router.navigate(['/edit-recipe', recipeId]);
  }

  deleteRecipe(recipeId: string) {
    // Find the recipe by ID
    this.displayedRecipes$.pipe(take(1)).subscribe(recipes => {
      const recipe = recipes?.find(r => r.id === recipeId);
      if (recipe) {
        this.onDeleteRecipe(recipe);
      }
    });
  }

  onDeleteRecipe(recipe: Recipe) {
    const dialogRef = this.dialog.open(DeleteRecipeDialogComponent, {
      width: '340px',
      data: { recipe },
      disableClose: true,
      autoFocus: false,
      panelClass: 'center-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.store.select('auth').pipe(take(1)).subscribe((authState: any) => {
          this.store.dispatch(RecipeActions.deleteRecipe({ id: recipe.id, idToken: authState.idToken }));
        });
        
        // Show success message
        this.snackBar.open(this.translate.instant('Recipe deleted successfully'), this.translate.instant('Close'), { duration: 3000 });
        
        // Reload recipes after deletion
        this.subscriptions.push(
          this.currentUserId$
            .pipe(filter(userId => !!userId))
            .subscribe(userId => {
              this.loadUserRecipes(userId!, this.currentFilters);
            })
        );
      }
    });
  }

  private reloadWithFilters() {
    this.subscriptions.push(
      this.currentUserId$
        .pipe(filter(userId => !!userId))
        .subscribe(userId => {
          this.loadUserRecipes(userId!, this.currentFilters);
        })
    );
    
    sessionStorage.setItem('myRecipePageIndex', this.pageIndex.toString());
  }

  // TrackBy function for virtual scrolling performance
  trackByRecipeId(index: number, recipe: Recipe): string {
    return recipe.id;
  }
}

// Dialog component
@Component({
  selector: 'delete-recipe-dialog',
  template: `
    <h2 mat-dialog-title>Delete Recipe</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this recipe?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="close-dialog-btn" mat-button mat-dialog-close>No</button>
      <button class="Delete-recipe-btn" mat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      margin-bottom: 8px;
    }
    mat-dialog-content p {
      margin: 0 0 12px 0;
    }
    mat-dialog-actions button[color="warn"] {
      color: #e53935;
      font-weight: bold;
    }
  `],
  standalone: true,
  imports: [MatDialogModule, MatButton]
})
export class DeleteRecipeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { recipe: Recipe }
  ) {}
}

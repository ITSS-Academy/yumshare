import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, shareReplay, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Recipe } from '../../models/recipe.model';
import { Category } from '../../models/category.model';
import { RecipeStep } from '../../models/recipe-step.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { CachingService, CacheOptions } from '../caching/caching.service';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  [x: string]: any;
  private apiUrl = environment.apiUrl;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Cache for frequently accessed data
  private categoriesCache$ = new BehaviorSubject<Category[]>([]);
  private recipesCache = new Map<string, { data: Recipe[]; timestamp: number }>();

  constructor(
    private http: HttpClient,
    private cachingService: CachingService
  ) {
    // Preload categories
    // this.preloadCategories();
  }

  /**
   * Preload categories into cache
   */
  // private preloadCategories(): void {
  //   this.getCategories().subscribe(categories => {
  //     if (categories.data) {
  //       this.categoriesCache$.next(categories.data);
  //       // Cache categories for 1 hour
  //       this.cachingService.set('categories', categories.data, { ttl: 60 * 60 * 1000 });
  //     }
  //   });
  // }


  // // Get all categories with caching
  // getCategories(): Observable<PaginatedResponse<Category>> {
  //   // Check cache first
  //   const cached = this.cachingService.get<Category[]>('categories');
  //   if (cached) {
  //     return of({
  //       data: cached,
  //       total: cached.length,
  //       page: 1,
  //       size: cached.length,
  //       hasMore: false,
  //       totalPages: 1,
  //       current_page: 1,
  //       end_page: 1,
  //       has_next: false,
  //       has_prev: false,
  //       total_pages: 1
  //     });
  //   }

  //   // If not in cache, fetch from API and cache
  //   return this.cachingService.getOrSet(
  //     'categories',
  //     this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`),
  //     { ttl: this.CACHE_TTL }
  //   );
  // }

  // Create recipe with files
  createRecipeWithFiles(recipeData: FormData): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.apiUrl}/recipes/with-files`, recipeData);
  }

  // Create basic recipe
  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.apiUrl}/recipes`, recipe);
  }

  // Upload image for recipe
  uploadRecipeImage(recipeId: string, imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/image`, formData);
  }

  // Upload video for recipe
  uploadRecipeVideo(recipeId: string, videoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('video', videoFile);
    return this.http.post(`${this.apiUrl}/recipes/${recipeId}/video`, formData);
  }

  // Get recipe by ID
  getRecipeById(id: string): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}`);
  }

  // Check edit permission for recipe
  checkEditPermission(id: string): Observable<{canEdit: boolean, message: string, recipe?: Recipe}> {
    return this.http.get<{canEdit: boolean, message: string, recipe?: Recipe}>(`${this.apiUrl}/recipes/${id}/check-edit-permission`);
  }

  // Update recipe
  updateRecipe(id: string, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/recipes/${id}`, recipe);
  }

  // Update recipe with files
  updateRecipeWithFiles(id: string, recipeData: FormData): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/recipes/${id}/with-files`, recipeData);
  }

  // Delete recipe
  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/recipes/${id}`);
  }

  // Search recipes
  searchRecipes(
    query: string, 
    category?: string, 
    author?: string, 
    difficulty?: string,
    rating?: number,
    page: number = 1,
    size: number = 10,
    orderBy: string = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PaginatedResponse<Recipe>> {
    let params: any = { 
      query: query,
      page: page.toString(),
      size: size.toString(),
      orderBy: orderBy,
      order: order
    };
    
    if (category) params.category = category;
    if (author) params.author = author;
    if (difficulty) params.difficulty = difficulty;
    if (rating) params.rating = rating.toString();

    return this.http.get<PaginatedResponse<Recipe>>(`${this.apiUrl}/recipes/search`, { params });
  }

  // Get all categories
  getCategories(): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`);
  }

  // Get recipes by category
  getRecipesByCategory(
    categoryId: string,
    page: number = 1,
    size: number = 10,
    orderBy: string = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PaginatedResponse<Recipe>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderBy', orderBy)
      .set('order', order);
    
    return this.http.get<PaginatedResponse<Recipe>>(`${this.apiUrl}/recipes/category/${categoryId}`, { params });
  }
  getAllRecipes(
    page: number = 1,
    size: number = 10,
    orderBy: string = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC'
  ): Observable<PaginatedResponse<Recipe>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('orderBy', orderBy)
      .set('order', order);
    return this.http.get<PaginatedResponse<Recipe>>(`${this.apiUrl}/recipes`, { params });
  }

  // Get recipes by category main courses
  getRecipesByCategoryMainCourses(categoryId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/category/${categoryId}`);
  }

  // Get recipes by category beverages
  getRecipesByCategoryBeverages(categoryId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/category/${categoryId}`);
  }
  
  // Get recipes by category desserts
  getRecipesByCategoryDesserts(categoryId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/category/${categoryId}`);
  }

  // Get recipes by category snacks
  getRecipesByCategorySnacks(categoryId: string): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(`${this.apiUrl}/recipes/category/${categoryId}`);
  }

  // Get all recipes
// getAllRecipes(): Observable<PaginatedResponse<Recipe>> {
//   const params = new HttpParams()
//     .set('page', '1')
//     .set('size', '10')
//     .set('orderBy', 'created_at')
//     .set('order', 'DESC');
//   return this.http.get<PaginatedResponse<Recipe>>(`${this.apiUrl}/recipes`, { params });
// }
}

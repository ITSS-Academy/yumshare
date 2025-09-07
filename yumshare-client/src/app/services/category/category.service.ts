import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../../models/category.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { CachingService } from '../caching/caching.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;
    private categoriesCache$ = new BehaviorSubject<Category[]>([]);
    private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly SEARCH_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
    constructor(
      private http: HttpClient,
      private cachingService: CachingService,
    ) {
      // Preload categories
      this.preloadCategories();
    }
  
    /**
     * Preload categories into cache
     */
    private preloadCategories(): void {
      this.getCategories().subscribe(categories => {
        if (categories.data) {
          this.categoriesCache$.next(categories.data);
          // Cache categories for 1 hour
          this.cachingService.set('categories', categories.data, { ttl: 60 * 60 * 1000 });
        }
      });
    }
  
  
    // Get all categories with caching
    getCategories(): Observable<PaginatedResponse<Category>> {
      // Check cache first
      const cached = this.cachingService.get<Category[]>('categories');
      if (cached) {
        return of({
          data: cached,
          total: cached.length,
          page: 1,
          size: cached.length,
          hasMore: false,
          totalPages: 1,
          current_page: 1,
          end_page: 1,
          has_next: false,
          has_prev: false,
          total_pages: 1
        });
      }
  
      // If not in cache, fetch from API and cache
      return this.cachingService.getOrSet(
        'categories',
        this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`),
        { ttl: this.CACHE_TTL }
      );
    }

  // Lấy tất cả category (có phân trang)
  // getCategories(): Observable<PaginatedResponse<Category>> {
  //   return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories`);
  // }

  // Lấy category theo id
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  // Lấy recipes của category
  getCategoryRecipes(categoryId: string, page: number = 1, size: number = 10): Observable<any> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('size', size.toString());
    return this.http.get<any>(`${this.apiUrl}/categories/${categoryId}/recipes?${params}`);
  }

  // Lấy số lượng recipes của category
  getCategoryRecipeCount(categoryId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/categories/${categoryId}/recipe-count`);
  }

  // Tạo mới category
  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  // Cập nhật category
  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  // Xóa category
  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`);
  }

  // Lấy thống kê category
  getCategoryStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/stats`);
  }

  // Tìm kiếm category
  searchCategories(params?: any): Observable<PaginatedResponse<Category>> {
    return this.http.get<PaginatedResponse<Category>>(`${this.apiUrl}/categories/search`, { params });
  }
}
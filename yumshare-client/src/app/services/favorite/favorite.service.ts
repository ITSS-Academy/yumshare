import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Favorite } from '../../models/favorite.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface CreateFavoriteRequest {
  user_id: string;
  recipe_id: string;
}

export interface QueryOptions {
  page?: number;
  size?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC' | 'asc' | 'desc';
  query?: string;
  category?: string;
  author?: string;
  difficulty?: string;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Xử lý lỗi HTTP
   * @param error - HttpErrorResponse
   * @returns Observable<never>
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Đã xảy ra lỗi không xác định';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Lỗi: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Dữ liệu không hợp lệ';
          break;
        case 401:
          errorMessage = 'Bạn cần Login để thực hiện thao tác này';
          break;
        case 403:
          errorMessage = 'Bạn không có quyền thực hiện thao tác này';
          break;
        case 404:
          errorMessage = 'Không tìm thấy dữ liệu';
          break;
        case 409:
          errorMessage = error.error?.message || 'Dữ liệu đã tồn tại';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau';
          break;
        default:
          errorMessage = `Lỗi ${error.status}: ${error.message}`;
      }
    }
    
    console.error('FavoriteService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Thêm recipe vào danh sách favorites
   * @param createFavoriteRequest - Thông tin user_id và recipe_id
   * @returns Observable<Favorite>
   */
  addToFavorites(createFavoriteRequest: CreateFavoriteRequest): Observable<Favorite> {
    if (!createFavoriteRequest.user_id || !createFavoriteRequest.recipe_id) {
      return throwError(() => new Error('user_id và recipe_id là bắt buộc'));
    }

    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, createFavoriteRequest)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Xóa recipe khỏi danh sách favorites
   * @param userId - ID của user
   * @param recipeId - ID của recipe
   * @returns Observable<{message: string}>
   */
  removeFromFavorites(userId: string, recipeId: string): Observable<{message: string}> {
    if (!userId || !recipeId) {
      return throwError(() => new Error('userId và recipeId là bắt buộc'));
    }

    return this.http.delete<{message: string}>(`${this.apiUrl}/favorites/${userId}/${recipeId}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Lấy danh sách favorites của user với phân trang
   * @param userId - ID của user
   * @param queryOptions - Các tùy chọn phân trang và lọc
   * @returns Observable<PaginatedResponse<Favorite>>
   */
  getUserFavorites(userId: string, queryOptions?: QueryOptions): Observable<PaginatedResponse<Favorite>> {
    if (!userId) {
      return throwError(() => new Error('userId là bắt buộc'));
    }

    let params = new HttpParams();
    
    if (queryOptions) {
      if (queryOptions.page) params = params.set('page', queryOptions.page.toString());
      if (queryOptions.size) params = params.set('size', queryOptions.size.toString());
      if (queryOptions.orderBy) params = params.set('orderBy', queryOptions.orderBy);
      if (queryOptions.order) params = params.set('order', queryOptions.order);
      if (queryOptions.query) params = params.set('query', queryOptions.query);
      if (queryOptions.category) params = params.set('category', queryOptions.category);
      if (queryOptions.author) params = params.set('author', queryOptions.author);
      if (queryOptions.difficulty) params = params.set('difficulty', queryOptions.difficulty);
      if (queryOptions.rating) params = params.set('rating', queryOptions.rating.toString());
    }

    return this.http.get<PaginatedResponse<Favorite>>(`${this.apiUrl}/favorites/user/${userId}`, { params })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Kiểm tra xem recipe có trong danh sách favorites của user không
   * @param userId - ID của user
   * @param recipeId - ID của recipe
   * @returns Observable<boolean>
   */
  isInFavorites(userId: string, recipeId: string): Observable<boolean> {
    if (!userId || !recipeId) {
      return throwError(() => new Error('userId và recipeId là bắt buộc'));
    }

    return this.http.get<boolean>(`${this.apiUrl}/favorites/check/${userId}/${recipeId}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Đếm số lượng favorites của user
   * @param userId - ID của user
   * @returns Observable<number>
   */
  getFavoriteCount(userId: string): Observable<number> {
    if (!userId) {
      return throwError(() => new Error('userId là bắt buộc'));
    }

    return this.http.get<number>(`${this.apiUrl}/favorites/count/${userId}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Toggle favorite status - thêm nếu chưa có, xóa nếu đã có
   * @param userId - ID của user
   * @param recipeId - ID của recipe
   * @returns Observable<boolean> - true nếu đã thêm, false nếu đã xóa
   */
  toggleFavorite(userId: string, recipeId: string): Observable<boolean> {
    if (!userId || !recipeId) {
      return throwError(() => new Error('userId và recipeId là bắt buộc'));
    }

    return new Observable(observer => {
      // Kiểm tra trạng thái hiện tại
      this.isInFavorites(userId, recipeId).subscribe({
        next: (isFavorite) => {
          if (isFavorite) {
            // Nếu đã có trong favorites, xóa nó
            this.removeFromFavorites(userId, recipeId).subscribe({
              next: () => {
                observer.next(false);
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          } else {
            // Nếu chưa có trong favorites, thêm nó
            this.addToFavorites({ user_id: userId, recipe_id: recipeId }).subscribe({
              next: () => {
                observer.next(true);
                observer.complete();
              },
              error: (error) => observer.error(error)
            });
          }
        },
        error: (error) => observer.error(error)
      });
    });
  }

  /**
   * Lấy danh sách tất cả favorites của user (không phân trang)
   * @param userId - ID của user
   * @returns Observable<Favorite[]>
   */
  getAllUserFavorites(userId: string): Observable<Favorite[]> {
    if (!userId) {
      return throwError(() => new Error('userId là bắt buộc'));
    }

    return this.getUserFavorites(userId, { size: 100 }) // Lấy tối đa 100 items (backend limit)
      .pipe(
        map(response => response.data),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Kiểm tra xem user có favorites nào không
   * @param userId - ID của user
   * @returns Observable<boolean>
   */
  hasFavorites(userId: string): Observable<boolean> {
    if (!userId) {
      return throwError(() => new Error('userId là bắt buộc'));
    }

    return this.getFavoriteCount(userId)
      .pipe(
        map(count => count > 0),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Lấy danh sách recipe IDs từ favorites của user
   * @param userId - ID của user
   * @returns Observable<string[]>
   */
  getUserFavoriteRecipeIds(userId: string): Observable<string[]> {
    if (!userId) {
      return throwError(() => new Error('userId là bắt buộc'));
    }

    return this.getAllUserFavorites(userId)
      .pipe(
        map(favorites => favorites.map(fav => fav.recipe_id)),
        catchError(this.handleError.bind(this))
      );
  }
}

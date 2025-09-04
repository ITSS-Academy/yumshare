import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comment } from '../models/comment.model';
import { PaginatedResponse } from '../models/paginated-response.model';

export interface CreateCommentDto {
  user_id: string;
  recipe_id: string;
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CommentQueryParams {
  page?: number;
  size?: number;
  orderBy?: string;
  order?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Tạo comment mới
   */
  createComment(commentData: CreateCommentDto): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, commentData);
  }

  /**
   * Lấy tất cả comments với pagination
   */
  getComments(params: CommentQueryParams = {}): Observable<PaginatedResponse<Comment>> {
    const httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('size', params.size?.toString() || '20')
      .set('orderBy', params.orderBy || 'created_at')
      .set('order', params.order || 'DESC');

    return this.http.get<PaginatedResponse<Comment>>(`${this.apiUrl}/comments`, { params: httpParams });
  }

  /**
   * Lấy comment theo ID
   */
  getCommentById(id: string): Observable<Comment> {
    return this.http.get<Comment>(`${this.apiUrl}/comments/${id}`);
  }

  /**
   * Cập nhật comment
   */
  updateComment(id: string, commentData: UpdateCommentDto): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/comments/${id}`, commentData);
  }

  /**
   * Xóa comment
   */
  deleteComment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${id}`);
  }

  /**
   * Lấy comments của một recipe cụ thể với pagination
   */
  getCommentsByRecipe(recipeId: string, params: CommentQueryParams = {}): Observable<PaginatedResponse<Comment>> {
    const httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('size', params.size?.toString() || '20')
      .set('orderBy', params.orderBy || 'created_at')
      .set('order', params.order || 'DESC');

    return this.http.get<PaginatedResponse<Comment>>(`${this.apiUrl}/comments/recipe/${recipeId}`, { params: httpParams });
  }

  /**
   * Lấy comments của một user cụ thể với pagination
   */
  getCommentsByUser(userId: string, params: CommentQueryParams = {}): Observable<PaginatedResponse<Comment>> {
    const httpParams = new HttpParams()
      .set('page', params.page?.toString() || '1')
      .set('size', params.size?.toString() || '20')
      .set('orderBy', params.orderBy || 'created_at')
      .set('order', params.order || 'DESC');

    return this.http.get<PaginatedResponse<Comment>>(`${this.apiUrl}/comments/user/${userId}`, { params: httpParams });
  }

  /**
   * Tìm kiếm comments theo nội dung
   */
  searchComments(query: string, params: CommentQueryParams = {}): Observable<PaginatedResponse<Comment>> {
    const httpParams = new HttpParams()
      .set('query', query)
      .set('page', params.page?.toString() || '1')
      .set('size', params.size?.toString() || '20')
      .set('orderBy', params.orderBy || 'created_at')
      .set('order', params.order || 'DESC');

    return this.http.get<PaginatedResponse<Comment>>(`${this.apiUrl}/comments/search`, { params: httpParams });
  }

  /**
   * Lấy số lượng comments của một recipe
   */
  getCommentCountByRecipe(recipeId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/comments/recipe/${recipeId}/count`);
  }

  /**
   * Lấy số lượng comments của một user
   */
  getCommentCountByUser(userId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/comments/user/${userId}/count`);
  }
}

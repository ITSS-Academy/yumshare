import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Like } from '../../models'; 
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LikesApiService {
  private apiUrl = `${environment.apiUrl}/likes`; 
  private pendingOperations = new Set<string>(); // Track pending operations

  constructor(private http: HttpClient) {}

  likeRecipe(userId: string, recipeId: string): Observable<Like> {
    // ĐÚNG: gửi đúng tên trường snake_case cho backend
    return this.http.post<Like>(`${this.apiUrl}`, { user_id: userId, recipe_id: recipeId });
  }

  unlikeRecipe(userId: string, recipeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/${recipeId}`);
  }

  getLikesByRecipe(recipeId: string): Observable<Like[]> {
    return this.http.get<Like[]>(`${this.apiUrl}/recipe/${recipeId}`);
  }

  getLikeCount(recipeId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${recipeId}`);
  }

  checkIfLiked(userId: string, recipeId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/${userId}/${recipeId}`);
  }

  getRecipeLikes(recipeId: string): Observable<Like[]> {
    return this.getLikesByRecipe(recipeId);
  }

  getRecipeLikeCount(recipeId: string): Observable<number> {
    return this.getLikeCount(recipeId);
  }
  toggleLike(userId: string, recipeId: string): Observable<boolean> {
    if (!userId || !recipeId) {
      return throwError(() => new Error('userId và recipeId là bắt buộc'));
    }

    const operationKey = `${userId}-${recipeId}`;
    
    // Check if there's already a pending operation for this user-recipe combination
    if (this.pendingOperations.has(operationKey)) {
      return throwError(() => new Error('Operation already in progress'));
    }

    // Mark operation as pending
    this.pendingOperations.add(operationKey);

    return new Observable<boolean>(observer => {
      this.checkIfLiked(userId, recipeId).subscribe({
        next: (isLiked) => {
          if (isLiked) {
            // Nếu đã like, thì unlike
            this.unlikeRecipe(userId, recipeId).subscribe({
              next: () => {
                this.pendingOperations.delete(operationKey);
                observer.next(false); // Đã unlike
                observer.complete();
              },
              error: (error) => {
                this.pendingOperations.delete(operationKey);
                observer.error(error);
              }
            });
          } else {
            // Nếu chưa like, thì like
            this.likeRecipe(userId, recipeId).subscribe({
              next: () => {
                this.pendingOperations.delete(operationKey);
                observer.next(true); // Đã like
                observer.complete();
              },
              error: (error) => {
                this.pendingOperations.delete(operationKey);
                observer.error(error);
              }
            });
          }
        },
        error: (error) => {
          this.pendingOperations.delete(operationKey);
          observer.error(error);
        }
      });
    });
  }
}
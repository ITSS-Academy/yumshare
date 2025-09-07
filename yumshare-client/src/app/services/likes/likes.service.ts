import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Like } from '../../models'; 
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LikesApiService {
  private apiUrl = 'http://localhost:3000/likes'; 

  constructor(private http: HttpClient) {}

  likeRecipe(userId: string, recipeId: string): Observable<Like> {
    // ĐÚNG: gửi đúng tên trường snake_case cho backend
    console.log('Like payload:', { user_id: userId, recipe_id: recipeId });
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

  return new Observable<boolean>(observer => {
    this.checkIfLiked(userId, recipeId).subscribe({
      next: (isLiked) => {
        if (isLiked) {
          // Nếu đã like, thì unlike
          this.unlikeRecipe(userId, recipeId).subscribe({
            next: () => {
              observer.next(false); // Đã unlike
              observer.complete();
            },
            error: (error) => observer.error(error)
          });
        } else {
          // Nếu chưa like, thì like
          this.likeRecipe(userId, recipeId).subscribe({
            next: () => {
              observer.next(true); // Đã like
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
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Follow } from '../../models/follow.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  constructor(private http: HttpClient) { }

  // Follow a user
  followUser(followerId: string, followingId: string): Observable<Follow> {
    const payload = {
      follower_id: followerId,
      following_id: followingId
    };
    
    return this.http.post<Follow>(`${environment.apiUrl}/follows`, payload);
  }

  // Unfollow a user
  unfollowUser(followerId: string, followingId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/follows/${followerId}/${followingId}`);
  }

  // Get followers of a user
  getFollowers(userId: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Follow>> {
    return this.http.get<PaginatedResponse<Follow>>(`${environment.apiUrl}/follows/followers/${userId}?page=${page}&limit=${limit}`);
  }

  // Get users that a user is following
  getFollowing(userId: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<Follow>> {
    return this.http.get<PaginatedResponse<Follow>>(`${environment.apiUrl}/follows/following/${userId}?page=${page}&limit=${limit}`);
  }

  // Check if a user is following another user
  isFollowing(followerId: string, followingId: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.apiUrl}/follows/check/${followerId}/${followingId}`);
  }

  // Get follower count for a user
  getFollowerCount(userId: string): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/follows/count/followers/${userId}`);
  }

  // Get following count for a user
  getFollowingCount(userId: string): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/follows/count/following/${userId}`);
  }


}

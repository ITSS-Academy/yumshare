import { Follow } from '../../models/follow.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

export interface FollowState {
  // Follow/Unfollow state
  isLoading: boolean;
  error: string | null;
  unfollowSuccess: boolean;
  
  // Followers data
  followers: PaginatedResponse<Follow> | null;
  
  // Following data
  following: PaginatedResponse<Follow> | null;
  
  // Following status
  isFollowing: boolean | null;
  
  // Counts
  followerCount: number | null;
  followingCount: number | null;
}

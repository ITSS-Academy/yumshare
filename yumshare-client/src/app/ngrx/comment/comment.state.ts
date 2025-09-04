import { Comment } from '../../models/comment.model';

export interface CommentState {
  // All Comments
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;

  // Comments by Recipe
  commentsByRecipe: Comment[];
  commentsByRecipeLoading: boolean;
  commentsByRecipeError: string | null;

  // Comments by User
  commentsByUser: Comment[];
  commentsByUserLoading: boolean;
  commentsByUserError: string | null;

  // Current Comment
  currentComment: Comment | null;
  currentCommentLoading: boolean;
  currentCommentError: string | null;

  // Search Results
  searchResults: Comment[];
  searchQuery: string;
  searchLoading: boolean;
  searchError: string | null;

  // Comment Counts
  commentCounts: { [key: string]: number };
  commentCountsLoading: boolean;
  commentCountsError: string | null;

  // Create/Update/Delete operations
  operationLoading: boolean;
  operationError: string | null;

  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
}

export const initialCommentState: CommentState = {
  // All Comments
  comments: [],
  commentsLoading: false,
  commentsError: null,

  // Comments by Recipe
  commentsByRecipe: [],
  commentsByRecipeLoading: false,
  commentsByRecipeError: null,

  // Comments by User
  commentsByUser: [],
  commentsByUserLoading: false,
  commentsByUserError: null,

  // Current Comment
  currentComment: null,
  currentCommentLoading: false,
  currentCommentError: null,

  // Search Results
  searchResults: [],
  searchQuery: '',
  searchLoading: false,
  searchError: null,

  // Comment Counts
  commentCounts: {},
  commentCountsLoading: false,
  commentCountsError: null,

  // Operations
  operationLoading: false,
  operationError: null,

  // Pagination
  pagination: null,
};

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  current_page: number;
  total_pages: number;
  end_page: number;
  has_next: boolean;
  has_prev: boolean;
}

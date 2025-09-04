export class ListResult<T> {
  data: T[];
  end_page: number;
  total: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;

  constructor(data: T[], total: number, currentPage: number, pageSize: number) {
    this.data = data;
    this.total = total;
    this.current_page = currentPage;
    this.total_pages = Math.ceil(total / pageSize);
    this.end_page = this.total_pages;
    this.has_next = currentPage < this.total_pages;
    this.has_prev = currentPage > 1;
  }
}

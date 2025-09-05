import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard, MatCardActions, MatCardContent, MatCardImage } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { LowerCasePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatIcon,
    MatCardImage,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  keyword: string = '';
  selectedCategory: string = '';
  categories: string[] = ['Salads', 'Soups', 'Desserts'];

  results: any[] = []; // Dữ liệu kết quả tìm kiếm
  pageSize = 8;
  currentPage = 1;
  totalPages = 0;
  visiblePages: number[] = [];
  showEllipsis = false;
  displayedResults: any[] = [];

  ngOnInit() {
    // Khởi tạo dữ liệu mẫu hoặc lấy từ service
    this.results = [
      // ...thêm dữ liệu mẫu ở đây...
    ];
    this.setupPagination();
  }

  setupPagination() {
    this.totalPages = Math.ceil(this.results.length / this.pageSize);
    this.updateVisiblePages();
    this.goToPage(1);
  }

  updateVisiblePages() {
    const maxVisible = 3;
    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - 1);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    this.visiblePages = pages;
    this.showEllipsis = this.totalPages > end;
  }

  goToPage(page: number) {
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedResults = this.results.slice(start, end);
    this.updateVisiblePages();
  }

  prevPage() {
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1);
  }

  toggleFavorite(item: any) {
    item.isFavorite = !item.isFavorite;
  }

  onSearch() {
    // Thực hiện tìm kiếm nội bộ
    let filtered = this.results;
    if (this.keyword) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(this.keyword.toLowerCase()) ||
        item.author.toLowerCase().includes(this.keyword.toLowerCase())
      );
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }
    this.results = filtered;
    this.setupPagination();
  }
}

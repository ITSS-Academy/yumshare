import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {NgClass, NgFor, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
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
export class SearchComponent {
  keyword: string = '';
  selectedCategory: string = '';
  categories: string[] = ['Salads', 'Soups', 'Desserts'];
  displayedResults: any[] = [];

  results = [
    {
      title: 'Salad',
      description: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      image: 'assets/salad.jpg',
      author: 'Anh Vu',
      authorAvatar: 'assets/avatar.png',
      rating: 4,
      isFavorite: false
    },
    {
      title: 'Salad',
      description: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      image: 'assets/salad.jpg',
      author: 'Van Nghia',
      authorAvatar: 'assets/avatar.png',
      rating: 5,
      isFavorite: false
    },
    {
      title: 'Soups',
      description: 'Soups',
      image: 'assets/soup.jpg',
      author: 'Quoc Viet',
      authorAvatar: 'assets/avatar.png',
      rating: 1,
      isFavorite: false
    },
    {
      title: 'Soups',
      description: 'Soups',
      image: 'assets/soup.jpg',
      author: 'Quoc Viet',
      authorAvatar: 'assets/avatar.png',
      rating: 1,
      isFavorite: false
    },
  ];

  allResults = [...this.results];
  pageSize = 8;
  currentPage = 1;
  totalPages = 0;
  visiblePages: number[] = [];
  showEllipsis = false;

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

  constructor() {
    this.setupPagination();
  }

  onSearch() {
    console.log('Search clicked:', this.keyword, this.selectedCategory);
    this.results = this.allResults.filter(item => {
      const keywordLower = this.keyword.toLowerCase();
      const matchKeyword = keywordLower
        ? item.title.toLowerCase().includes(keywordLower) ||
        item.description.toLowerCase().includes(keywordLower) ||
        item.author.toLowerCase().includes(keywordLower)
        : true;

      const matchCategory = this.selectedCategory
        ? item.title.toLowerCase() === this.selectedCategory.toLowerCase()
        : true;

      return matchKeyword && matchCategory;
    });
    this.setupPagination();
  }
}

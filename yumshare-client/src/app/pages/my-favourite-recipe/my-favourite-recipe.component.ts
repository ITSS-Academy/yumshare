import { Component, OnInit } from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton, MatIconButton, MatMiniFabButton} from "@angular/material/button";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerModule,
  MatDatepickerToggle
} from "@angular/material/datepicker";
import {MatInput, MatInputModule, MatSuffix} from "@angular/material/input";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {SideBarComponent} from '../../components/side-bar/side-bar.component';
import {NavBarComponent} from '../../components/nav-bar/nav-bar.component';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTimepickerModule} from '@angular/material/timepicker';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-my-favourite-recipe',
  imports: [
    FormsModule,
    SideBarComponent,
    NavBarComponent,
    MatFormField,
    MatInput,
    MatDatepickerInput,
    MatDatepicker,
    MatDatepickerToggle,
    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTimepickerModule,
    MatMenu,
    MatButton,
    MatMenuTrigger,
    MatMenuItem,
    MatIcon,
    MatIconButton,
    MatMiniFabButton,
    NgClass,
  ],
  templateUrl: './my-favourite-recipe.component.html',
  styleUrl: './my-favourite-recipe.component.scss'
})
export class MyFavouriteRecipeComponent implements OnInit {
  value: Date | null = null;

  // Pagination properties
  pageIndex = 0;
  pageSize = 6; // Cố định limit là 6
  totalRecipes = 23; // Số lượng công thức giả lập, thay bằng dữ liệu thực tế nếu có
  recipes = Array.from({ length: this.totalRecipes }, (_, i) => ({
    name: `Recipe Name ${i + 1}`,
    author: `Author ${i + 1}`,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: 'Post date',
    isFavourite: true, // Ban đầu là yêu thích
    heartbeat: false   // Hiệu ứng nhịp tim
  }));

  selectedCategory: string = 'Category';
  selectedDifficulty: string = 'Difficulty';

  get totalPages(): number {
    return Math.ceil(this.totalRecipes / this.pageSize);
  }

  get displayedRecipes() {
    const start = this.pageIndex * this.pageSize;
    return this.recipes.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.pageIndex;
    const delta = 2;
    const range: number[] = [];
    let left = Math.max(0, current - delta);
    let right = Math.min(total - 1, current + delta);

    if (current <= delta) {
      right = Math.min(total - 1, 2 * delta);
    }
    if (current >= total - 1 - delta) {
      left = Math.max(0, total - 1 - 2 * delta);
    }

    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    return range;
  }

  // Hàm helper để reload trang và scroll lên đầu
  private reloadPageAndScrollToTop() {
    // Lưu pageIndex vào sessionStorage để giữ lại sau khi reload
    sessionStorage.setItem('myFavouriteRecipePageIndex', this.pageIndex.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.reload();
  }

  // Hàm khôi phục pageIndex từ sessionStorage khi component được khởi tạo
  ngOnInit() {
    const savedPageIndex = sessionStorage.getItem('myFavouriteRecipePageIndex');
    if (savedPageIndex !== null) {
      this.pageIndex = parseInt(savedPageIndex);
      // Xóa sessionStorage sau khi đã khôi phục
      sessionStorage.removeItem('myFavouriteRecipePageIndex');
    }
  }

  setCategory(option: string) {
    this.selectedCategory = option;
    // ...nếu cần lọc dữ liệu theo category, thêm logic tại đây...
  }

  setDifficulty(option: string) {
    this.selectedDifficulty = option;
    // ...nếu cần lọc dữ liệu theo difficulty, thêm logic tại đây...
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.pageIndex = page;
      this.reloadPageAndScrollToTop();
    }
  }

  goToFirst() {
    this.pageIndex = 0;
    this.reloadPageAndScrollToTop();
  }

  goToLast() {
    this.pageIndex = this.totalPages - 1;
    this.reloadPageAndScrollToTop();
  }

  goToPrev() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.reloadPageAndScrollToTop();
    }
  }

  goToNext() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.reloadPageAndScrollToTop();
    }
  }

  toggleFavourite(recipe: any) {
    recipe.isFavourite = !recipe.isFavourite;
    recipe.heartbeat = false;
    setTimeout(() => {
      recipe.heartbeat = true;
      setTimeout(() => recipe.heartbeat = false, 500);
    }, 0);
  }
}

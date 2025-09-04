import { ChangeDetectionStrategy, Component, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { NavBarComponent } from '../../components/nav-bar/nav-bar.component';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerModule,
  MatTimepickerToggle
} from '@angular/material/timepicker';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-my-recipe',
  standalone: true,
  imports: [
    FormsModule,
    
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
    MatPaginatorModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './my-recipe.component.html',
  styleUrl: './my-recipe.component.scss'
})
export class MyRecipeComponent implements OnInit {
  value: Date | null = null;

  // Pagination properties
  pageIndex = 0;
  pageSize = 6; // Cố định limit là 6
  totalRecipes = 23; // Số lượng công thức giả lập, thay bằng dữ liệu thực tế nếu có
  recipes = Array.from({ length: this.totalRecipes }, (_, i) => ({
    name: `Recipe Name ${i + 1}`,
    author: `Author ${i + 1}`,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    date: 'Post date'
  }));

  selectedDifficulty: string = 'Difficulty';
  selectedCategory: string = 'Category';

  constructor(private router: Router, private dialog: MatDialog) {}

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
    sessionStorage.setItem('myRecipePageIndex', this.pageIndex.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.reload();
  }

  // Hàm khôi phục pageIndex từ sessionStorage khi component được khởi tạo
  ngOnInit() {
    const savedPageIndex = sessionStorage.getItem('myRecipePageIndex');
    if (savedPageIndex !== null) {
      this.pageIndex = parseInt(savedPageIndex);
      // Xóa sessionStorage sau khi đã khôi phục
      sessionStorage.removeItem('myRecipePageIndex');
    }
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

  onEditRecipe(recipe: any) {
    // Giả sử dùng index làm id, bạn có thể thay bằng recipe.id nếu có
    const recipeIndex = this.recipes.indexOf(recipe);
    this.router.navigate(['/edit-recipe', recipeIndex]);
  }

  onDeleteRecipe(recipe: any) {
    const dialogRef = this.dialog.open(DeleteRecipeDialogComponent, {
      width: '340px',
      data: { recipe },
      disableClose: true,
      autoFocus: false,
      panelClass: 'center-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const idx = this.recipes.indexOf(recipe);
        if (idx > -1) {
          this.recipes.splice(idx, 1);
          this.totalRecipes--;
          if (this.pageIndex > 0 && this.displayedRecipes.length === 0) {
            this.pageIndex--;
          }
        }
      }
    });
  }

  setDifficulty(option: string) {
    this.selectedDifficulty = option;
    // ...nếu cần lọc dữ liệu theo độ khó, thêm logic tại đây...
  }

  setCategory(option: string) {
    this.selectedCategory = option;
    // ...nếu cần lọc dữ liệu theo category, thêm logic tại đây...
  }

}

// Dialog component
@Component({
  selector: 'delete-recipe-dialog',
  template: `
    <h2 mat-dialog-title>Delete Recipe</h2>
    <mat-dialog-content>
      <p>Are you sure you want to delete this recipe?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="close-dialog-btn" mat-button mat-dialog-close>No</button>
      <button class="Delete-recipe-btn" mat-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      margin-bottom: 8px;
    }
    mat-dialog-content p {
      margin: 0 0 12px 0;
    }
    mat-dialog-actions button[color="warn"] {
      color: #e53935;
      font-weight: bold;
    }
  `],
  standalone: true,
  imports: [MatDialogModule, MatButton]
})
export class DeleteRecipeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteRecipeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

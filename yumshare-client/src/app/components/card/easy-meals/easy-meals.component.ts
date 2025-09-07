import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from "@angular/material/card";
import {ShareModule} from '../../../shares/share.module';
import { CommonModule } from '@angular/common';
import { LazyImageDirective } from '../../../directives/lazy-image/lazy-image.directive';

@Component({
  selector: 'app-easy-meals',
    imports: [
    MatCard,
    MatCardActions,
    MatCardContent,
    ShareModule,
    CommonModule,
    LazyImageDirective,
],
  templateUrl: './easy-meals.component.html',
  styleUrl: './easy-meals.component.scss'
})
export class EasyMealsComponent {
    // Chia sẻ món ăn
  shareRecipe(item: any) {
    const url = `${window.location.origin}/recipe-detail/${item.id}`;
    const title = item.title || 'YumShare Recipe';
    const text = `Check out this recipe: ${title}`;
    if (navigator.share) {
      navigator.share({ title, text, url })
        .catch(err => console.log('Share failed:', err));
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  }
  @Input() cardData: any[] = [];

  constructor(private router: Router) {}

  // ❤️ toggle tim
  toggleFavorite(item: any) {
    item.isFavorite = !item.isFavorite;
  }

  navigationToDetail(id: string) {
    this.router.navigate(['/recipe-detail', id]).then();
  }

  getDifficultyLabel(difficulty: any): string {
  if (difficulty === 1 || difficulty === '1' || difficulty?.toLowerCase?.() === 'easy') return 'Easy';
  if (difficulty === 2 || difficulty === '2' || difficulty?.toLowerCase?.() === 'medium') return 'Medium';
  if (difficulty === 3 || difficulty === '3' || difficulty?.toLowerCase?.() === 'hard') return 'Hard';
  return difficulty || 'Unknown';
}
getDifficultyClass(difficulty: any): string {
  if (difficulty === 1 || difficulty === '1' || difficulty?.toLowerCase?.() === 'easy') return 'easy';
  if (difficulty === 2 || difficulty === '2' || difficulty?.toLowerCase?.() === 'medium') return 'medium';
  if (difficulty === 3 || difficulty === '3' || difficulty?.toLowerCase?.() === 'hard') return 'hard';
  return '';
} 
}

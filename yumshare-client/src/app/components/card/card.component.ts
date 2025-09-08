import { Component, Input } from '@angular/core';
import { MatCard, MatCardActions, MatCardContent, MatCardImage } from "@angular/material/card";
import { ShareModule } from '../../shares/share.module';
import { CommonModule } from '@angular/common';
import { LazyImageDirective } from '../../directives/lazy-image/lazy-image.directive';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLikeCounts } from '../../ngrx/likes/likes.selectors';

@Component({
  selector: 'app-card',
  imports: [
    MatCard,
    MatCardActions,
    MatCardContent,
    ShareModule,
    CommonModule,
    LazyImageDirective
  ],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() cardData: any[] = [];

  likeCounts$!: Observable<{ [recipeId: string]: number }>;

  constructor(private router: Router, private store: Store) {
    this.likeCounts$ = this.store.select(selectLikeCounts);
  }

  // Chia sẻ món ăn
  shareRecipe(item: any) {
    const url = `${window.location.origin}/recipe-detail/${item.id}`;
    const title = item.title || 'YumShare Recipe';
    const text = `Check out this recipe: ${title}`;
    if (navigator.share) {
      navigator.share({ title, text, url })
        .catch(err => console.log('Share failed:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  }

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

  getLikeCount(likeCounts: { [id: string]: number }, item: any): number {
    return likeCounts?.[item.id] ?? item.likes ?? 0;
  }
}
import {Component, Input} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from "@angular/material/card";
import {ShareModule} from '../../shares/share.module';
import {CommonModule} from '@angular/common';
import {LazyImageDirective} from '../../directives/lazy-image/lazy-image.directive';
import { Router } from '@angular/router';
// import {ResponsiveImageComponent} from '../responsive-image/responsive-image.component';
// import {LazyImageDirective} from '../../directives/lazy-image/lazy-image.directive';
// import {SlideInDirective} from '../../directives/animations/slide-in.directive';

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

  constructor(private router: Router) {}

  // ❤️ toggle tim
  toggleFavorite(item: any) {
    item.isFavorite = !item.isFavorite;
  }

  navigationToDetail(id: string) {
    this.router.navigate(['/recipe-detail', id]).then();
  }
}

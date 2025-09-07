import { Component } from '@angular/core';
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
  constructor(private router: Router) {}

  cardData = [
    {
      id: 1,
      title: 'Delicious Pasta',
      description: 'A classic Italian pasta dish with rich tomato sauce and fresh basil.',
      imageUrl: 'https://mia.vn/media/uploads/blog-du-lich/mon-an-ngay-tet-1706077156.jpg',
      difficulty: 'easy',
      cookTime: 30,
      isFavorite: false,
    },
    {
      id: 2,
      title: 'Sushi Platter',
      description: 'An assortment of fresh sushi rolls and sashimi, perfect for sharing.',
      imageUrl: 'https://cdn3.ivivu.com/2023/08/pho-bo-ivivu.jpeg',
      difficulty: 'medium',
      cookTime: 45,
      isFavorite: false,
    },
    {
      id: 3,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg',
      difficulty: 'hard',
      cookTime: 60,
      isFavorite: false,
    },
    {
      id: 4,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s',
      difficulty: 'easy',
      cookTime: 25,
      isFavorite: false,
    },

    {
      id: 5,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg',
      difficulty: 'hard',
      cookTime: 60,
      isFavorite: false,
    },

    {
      id: 6,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s',
      difficulty: 'easy',
      cookTime: 25,
      isFavorite: false,
    },

    {
      id: 7,
      title: 'Delicious Pasta',
      description: 'A classic Italian pasta dish with rich tomato sauce and fresh basil.',
      imageUrl: 'https://mia.vn/media/uploads/blog-du-lich/mon-an-ngay-tet-1706077156.jpg',
      difficulty: 'easy',
      cookTime: 30,
      isFavorite: false,
    },
    {
      id: 8,
      title: 'Sushi Platter',
      description: 'An assortment of fresh sushi rolls and sashimi, perfect for sharing.',
      imageUrl: 'https://cdn3.ivivu.com/2023/08/pho-bo-ivivu.jpeg',
      difficulty: 'medium',
      cookTime: 45,
      isFavorite: false,
    },
    {
      id: 9,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg',
      difficulty: 'hard',
      cookTime: 60,
      isFavorite: false,
    },

    {
      id: 10,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s',
      difficulty: 'easy',
      cookTime: 25,
      isFavorite: false,
    },
  ];

  // ❤️ toggle tim
  toggleFavorite(item: any) {
    item.isFavorite = !item.isFavorite;
  }

  navigationToDetail(id: string) {
    this.router.navigate(['/recipe-detail', id]).then();
  }
}

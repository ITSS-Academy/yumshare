import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from "@angular/material/card";
import {ShareModule} from '../../shares/share.module';
import {RecipeCardSkeletonComponent} from '../skeleton/recipe-card-skeleton.component';
import {CommonModule} from '@angular/common';
import {LazyImageDirective} from '../../directives/lazy-image/lazy-image.directive';
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

  cardData = [
    {
      id: 1,
      title: 'Delicious Pasta',
      description: 'A classic Italian pasta dish with rich tomato sauce and fresh basil. ajhs hanka askd ajks ajds asda asdka ',
      imageUrl: 'https://mia.vn/media/uploads/blog-du-lich/mon-an-ngay-tet-1706077156.jpg',
      rating: 0,
      isFavorite: false,
    },
    {
      id: 2,
      title: 'Sushi Platter',
      description: 'An assortment',
      imageUrl: 'https://cdn3.ivivu.com/2023/08/pho-bo-ivivu.jpeg',
      rating: 0,
      isFavorite: false,
    },
    {
      id: 3,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg',
      rating: 0,
      isFavorite: false,
    },

    {
      id: 4,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s',
      rating: 0,
      isFavorite: false,
    },

    {
      id: 5,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg',
      rating: 0,
      isFavorite: false,
    },

    {
      id: 6,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s',
      rating: 0,
      isFavorite: false,
    },

    {
      id: 7,
      title: 'Delicious Pasta',
      description: 'A classic Italian pasta dish with rich tomato sauce and fresh basil.',
      imageUrl: 'https://mia.vn/media/uploads/blog-du-lich/mon-an-ngay-tet-1706077156.jpg',
      rating: 0,
      isFavorite: false,
    },
    {
      id: 8,
      title: 'Sushi Platter',
      description: 'An assortment of fresh sushi rolls and sashimi, perfect for sharing.',
      imageUrl: 'https://cdn3.ivivu.com/2023/08/pho-bo-ivivu.jpeg',
      rating: 0,
      isFavorite: false,
    },
    {
      id: 9,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg',
      rating: 0,
      isFavorite: false,
    },

    {
      id: 10,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s',
      rating: 0,
      isFavorite: false,
    },
  ];

  // ❤️ toggle tim
  toggleFavorite(item: any) {
    item.isFavorite = !item.isFavorite;
  }

  // setRating(itemId: number, rating: number) {
  //   const item = this.cardData.find(c => c.id === itemId);
  //   if (item) {
  //     item.rating = rating;
  //   }
  // }
}


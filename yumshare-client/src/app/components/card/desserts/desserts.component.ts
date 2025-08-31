import {Component, ElementRef, ViewChild} from '@angular/core';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from "@angular/material/card";
import {ShareModule} from '../../../shares/share.module';

@Component({
  selector: 'app-desserts',
    imports: [
        MatCard,
        MatCardActions,
        MatCardContent,
        MatCardImage,
        ShareModule
    ],
  templateUrl: './desserts.component.html',
  styleUrl: './desserts.component.scss'
})
export class DessertsComponent {
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

  // @ViewChild('todayCarousel', {static: false}) todayCarousel!: ElementRef;
  //
  // private scrollAnimation: number | null = null;
  // private scrollTarget: number | null = null;
  //
  // smoothScroll(element: HTMLElement, distance: number, duration: number) {
  //   if (this.scrollAnimation) {
  //     cancelAnimationFrame(this.scrollAnimation);
  //     this.scrollAnimation = null;
  //   }
  //   const start = element.scrollLeft;
  //   // Nếu đang cuộn, lấy vị trí hiện tại làm điểm bắt đầu
  //   const current = element.scrollLeft;
  //   const target = current + distance;
  //   this.scrollTarget = target;
  //   const startTime = performance.now();
  //
  //   const animate = (now: number) => {
  //     const elapsed = now - startTime;
  //     const progress = Math.min(elapsed / duration, 1);
  //     // easeOutCubic cho cảm giác mượt hơn
  //     const ease = 1 - Math.pow(1 - progress, 3);
  //
  //     element.scrollLeft = current + (target - current) * ease;
  //
  //     // Nếu người dùng cuộn tay, dừng animation
  //     if (Math.abs(element.scrollLeft - target) < 1 || progress >= 1) {
  //       element.scrollLeft = target;
  //       this.scrollAnimation = null;
  //       this.scrollTarget = null;
  //     } else {
  //       this.scrollAnimation = requestAnimationFrame(animate);
  //     }
  //   };
  //
  //   this.scrollAnimation = requestAnimationFrame(animate);
  // }
  //
  // nextCard(carousel: HTMLElement) {
  //   const wrapper = carousel.querySelector('.container-card') as HTMLElement;
  //   this.smoothScroll(wrapper, 300, 600); // tăng thời gian để mượt hơn
  // }
  //
  // prevCard(carousel: HTMLElement) {
  //   const wrapper = carousel.querySelector('.container-card') as HTMLElement;
  //   this.smoothScroll(wrapper, -300, 600);
  // }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShareModule } from '../../shares/share.module';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ShareModule

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  carouselImages: string[] = [
    'https://beptueu.vn/hinhanh/tintuc/top-15-hinh-anh-mon-an-ngon-viet-nam-khien-ban-khong-the-roi-mat-1.jpg',
    'https://img-global.cpcdn.com/contest_banners/c6c26b4f7b87600f/1932x366cq80/banner.webp',
    'https://img-global.cpcdn.com/contest_banners/f9c0dbd9f3830efb/1932x366cq80/banner.webp'
  ];


  currentImageIndex = 0;
  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.nextImage();
    }, 3000);

    this.cardIntervalId = setInterval(() => {
      this.nextCardSet();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.cardIntervalId) {
      clearInterval(this.cardIntervalId);
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
  }

  prevImage() {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  carData = [
    {
      id: 1,
      title: 'Delicious Pasta',
      description: 'A classic Italian pasta dish with rich tomato sauce and fresh basil.',
      imageUrl: 'https://mia.vn/media/uploads/blog-du-lich/mon-an-ngay-tet-1706077156.jpg'
    },
    {
      id: 2,
      title: 'Sushi Platter',
      description: 'An assortment of fresh sushi rolls and sashimi, perfect for sharing.',
      imageUrl: 'https://cdn3.ivivu.com/2023/08/pho-bo-ivivu.jpeg'
    },
    {
      id: 3,
      title: 'Grilled Steak',
      description: 'Juicy grilled steak served with garlic butter and roasted vegetables.',
      imageUrl: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/052023/quan-com-tam-o-ha-noi-_20230524102142.jpg'
    },

    {
      id: 4,
      title: 'Vegan Buddha Bowl',
      description: 'A colorful bowl filled with quinoa, chickpeas, avocado,',
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTU6A75llbMJ7_6d6aH9yJ0ROIhPakIBwwHQ&s'

    }
  ];

  cardCarouselIndex = 0;
  cardsPerView = 3;
  private cardIntervalId: any;

  nextCardSet() {
    if (this.cardCarouselIndex < this.carData.length - this.cardsPerView) {
      this.cardCarouselIndex++;
    } else {
      this.cardCarouselIndex = 0;
    }
  }

  prevCardSet() {
    if (this.cardCarouselIndex > 0) {
      this.cardCarouselIndex--;
    } else {
      this.cardCarouselIndex = this.carData.length - this.cardsPerView;
    }
  }

  get visibleCards() {
    return this.carData.slice(this.cardCarouselIndex, this.cardCarouselIndex + this.cardsPerView);
  }
}

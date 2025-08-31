import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShareModule } from '../../shares/share.module';
import {CardComponent} from '../../components/card/card.component';
import {DessertsComponent} from '../../components/card/desserts/desserts.component';
import {BeveragesComponent} from '../../components/card/beverages/beverages.component';
import {AppetizersComponent} from '../../components/card/appetizers/appetizers.component';
import {VeganDishesComponent} from '../../components/card/vegan-dishes/vegan-dishes.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ShareModule,
    CardComponent,
    DessertsComponent,
    BeveragesComponent,
    AppetizersComponent,
    VeganDishesComponent

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  carouselImages: string[] = [
    'https://d3design.vn/uploads/Food_menu_web_banner_social_media_banner_template_Free_Psd7.jpg',
    'https://beptueu.vn/hinhanh/tintuc/top-15-hinh-anh-mon-an-ngon-viet-nam-khien-ban-khong-the-roi-mat-1.jpg',
    'https://img.pikbest.com/templates/20240714/delicious-food-menu-facebook-cover-and-web-banner-template_10667180.jpg!w700wp',
  ];


  currentImageIndex = 0;
  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.nextImage();
    }, 3000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length;
  }

  prevImage() {
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  nextTodayDish() {
    // TODO: Thêm logic chuyển trang Today's Dish ở đây
  }

  viewAllFamilyMeal() {
    // TODO: Th��m logic chuyển trang hoặc hiển thị toàn bộ Desserts ở đây
  }

  viewAllRefreshingDishes() {
    // TODO: Thêm logic chuyển trang hoặc hiển thị toàn bộ Beverages ở đây
  }

  viewAllNutritiousMeals() {
    // TODO: Thêm logic chuyển trang hoặc hiển thị toàn bộ ở đây
  }

  viewAllEasyMeals() {

  }
}

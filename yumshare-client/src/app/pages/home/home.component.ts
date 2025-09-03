import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShareModule } from '../../shares/share.module';
import {CardComponent} from '../../components/card/card.component';
import {FamilyMealComponent} from '../../components/card/family-meal/family-meal.component';
import {RefreshingDishesComponent} from '../../components/card/refreshing-dishes/refreshing-dishes.component';
import {NutritiousMealsComponent} from '../../components/card/nutritious-meals/nutritious-meals.component';
import {EasyMealsComponent} from '../../components/card/easy-meals/easy-meals.component';
import {Router} from '@angular/router';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ShareModule,
    CardComponent,
    FamilyMealComponent,
    RefreshingDishesComponent,
    NutritiousMealsComponent,
    EasyMealsComponent

  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private router: Router) {
  }
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
    this.router.navigate(['/search']).then();
  }

  viewAllFamilyMeal() {
    this.router.navigate(['/search']).then();
  }

  viewAllRefreshingDishes() {
    this.router.navigate(['/search']).then();
  }

  viewAllNutritiousMeals() {
    this.router.navigate(['/search']).then();
  }

  viewAllEasyMeals() {
    this.router.navigate(['/search']).then();
  }

  categoryClick(category: string) {
    this.router.navigate(['/search'], { queryParams: { category } }).then();
  }
}

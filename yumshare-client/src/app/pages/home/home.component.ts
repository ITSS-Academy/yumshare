import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShareModule } from '../../shared/share.module';
import {CardComponent} from '../../components/card/card.component';
import {Router} from '@angular/router';
import {select, Store} from '@ngrx/store';
import {RecipeState} from '../../ngrx/recipe';
import { Observable, Subscription } from 'rxjs';
import { Category, Recipe } from '../../models';
import * as categoryActions from '../../ngrx/category/category.actions';
import * as recipeActions from '../../ngrx/recipe/recipe.actions';
import { CategoryState } from '../../ngrx/category/category.state';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    ShareModule,
    CardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  category$!: Observable<Category[]>;
  
  paginatedRecipes$!: Observable<any>;
  paginatedRecipes: any;
  
  mainCourses$!: Observable<{ data: Recipe[], total: number } | null>;
  mainCourses: Recipe[] = [];

  beverages$!: Observable<{ data: Recipe[], total: number } | null>;
  beverages: Recipe[] = [];

  desserts$!: Observable<{ data: Recipe[], total: number } | null>;
  desserts: Recipe[] = [];

  snacks$!: Observable<{ data: Recipe[], total: number } | null>;
  snacks: Recipe[] = [];

  subscriptions: Subscription[] = [];
  constructor(private router: Router,
              private store: Store<{recipe: RecipeState, category: CategoryState}>,
              ) {
    this.category$ = this.store.select(state => state.category.activeCategories);
    this.paginatedRecipes$ = this.store.select(state => state.recipe.paginatedRecipes);
    this.mainCourses$ = this.store.select(state => state.recipe.getRecipesByCategoryMainCourses);
    this.beverages$ = this.store.select(state => state.recipe.getRecipesByCategoryBeverages);
    this.desserts$ = this.store.select(state => state.recipe.getRecipesByCategoryDesserts);
    this.snacks$ = this.store.select(state => state.recipe.getRecipesByCategorySnacks);

    this.store.dispatch(categoryActions.loadActiveCategories());
    this.store.dispatch(recipeActions.loadPaginatedRecipes({ page: 1, size: 10 }));
    this.store.dispatch(recipeActions.getRecipesByCategoryMainCourses({categoryId: '49a60260-4891-4e2a-8d89-4ae373a4f985'}));
    this.store.dispatch(recipeActions.getRecipesByCategoryBeverages({categoryId: 'ede393b2-64f8-4e69-a90e-86fb926a0262'}));
    this.store.dispatch(recipeActions.getRecipesByCategoryDesserts({categoryId: '6208d5b9-308f-4e12-bd33-f4c0c43b8279'}));
    this.store.dispatch(recipeActions.getRecipesByCategorySnacks({categoryId: '6d5ba137-7e96-4ae0-8873-259ea3afe284'}));

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

    this.subscriptions.push(
      this.category$.subscribe(categories => {
        // Categories loaded successfully
      })
    )

   this.subscriptions.push(
    this.paginatedRecipes$.subscribe(paginatedRecipes => {
      this.paginatedRecipes = paginatedRecipes;
      if (this.paginatedRecipes && !Array.isArray(this.paginatedRecipes.data)) {
        this.paginatedRecipes.data = [];
      }
    })
  );
  this.subscriptions.push(
  this.mainCourses$.subscribe(data => {
    // Handle different data structures
    if (Array.isArray(data?.data)) {
      this.mainCourses = data.data;
    } else if (Array.isArray(data)) {
      this.mainCourses = data;
    } else if (data?.data && typeof data.data === 'object' && 'data' in data.data) {
      // Handle nested object: {data: {data: [...]}}
      this.mainCourses = Array.isArray((data.data as any).data) ? (data.data as any).data : [];
    } else {
      this.mainCourses = [];
    }
    })
  );

  this.subscriptions.push(
    this.beverages$.subscribe(data => {
      // Handle different data structures
      if (Array.isArray(data?.data)) {
        this.beverages = data.data;
      } else if (Array.isArray(data)) {
        this.beverages = data;
      } else if (data?.data && typeof data.data === 'object' && 'data' in data.data) {
        // Handle nested object: {data: {data: [...]}}
        this.beverages = Array.isArray((data.data as any).data) ? (data.data as any).data : [];
      } else {
        this.beverages = [];
      }
    })
  );

  this.subscriptions.push(
    this.desserts$.subscribe(data => {
      // Handle different data structures
      if (Array.isArray(data?.data)) {
        this.desserts = data.data;
      } else if (Array.isArray(data)) {
        this.desserts = data;
      } else if (data?.data && typeof data.data === 'object' && 'data' in data.data) {
        // Handle nested object: {data: {data: [...]}}
        this.desserts = Array.isArray((data.data as any).data) ? (data.data as any).data : [];
      } else {
        this.desserts = [];
      }
    })
  );

  this.subscriptions.push(
    this.snacks$.subscribe(data => {
      // Handle different data structures
      if (Array.isArray(data?.data)) {
        this.snacks = data.data;
      } else if (Array.isArray(data)) {
        this.snacks = data;
      } else if (data?.data && typeof data.data === 'object' && 'data' in data.data) {
        // Handle nested object: {data: {data: [...]}}
        this.snacks = Array.isArray((data.data as any).data) ? (data.data as any).data : [];
      } else {
        this.snacks = [];
      }
    })
  );
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());  
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

  viewAllMainCourses() {
    this.router.navigate(['/search']).then();
  }

  viewAllBeverages() {
    this.router.navigate(['/search']).then();
  }

  viewAllDesserts() {
    this.router.navigate(['/search']).then();
  }

  viewAllSnacks() {
    this.router.navigate(['/search']).then();
  }

  categoryClick(category: Category) {
    this.router.navigate(['/search']).then();
  }

}

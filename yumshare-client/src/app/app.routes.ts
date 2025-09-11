import { Routes, ExtraOptions } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'add-recipe',
    loadComponent: () =>
      import('./pages/add-recipe/add-recipe.component').then(
        (m) => m.AddRecipeComponent
      )
  },
  {
    path: 'edit-recipe/:id',
    loadComponent: () =>
      import('./pages/edit-recipe/edit-recipe.component').then(
        (m) => m.EditRecipeComponent
      )
  },
  {
    path: 'my-recipe',
    loadComponent: () =>
      import('./pages/my-recipe/my-recipe.component').then(
        (m) => m.MyRecipeComponent
      )
  },
  {
    path: 'my-favourite-recipe',
    loadComponent: () =>
      import('./pages/my-favourite-recipe/my-favourite-recipe.component').then(
        (m) => m.MyFavouriteRecipeComponent
      )
  },
  {
    path: 'recipe-detail/:id',
    loadComponent: () =>
      import('./pages/recipe-detail/recipe-detail.component').then(
        (m) => m.RecipeDetailComponent
      )
  },
  
  {
    path:'search',
    loadComponent: () =>
      import('./pages/search/search.component').then(
        (m) => m.SearchComponent
      )
  },
  {
    path: 'message',
    loadComponent: () =>
      import('./pages/message/message.component').then((m) => m.MessageComponent)
  },
  {
    path: 'chat/:id',
    loadComponent: () =>
      import('./pages/message/message.component').then((m) => m.MessageComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent
      )
  },


  {
    path: 'faq',
    loadComponent: () =>
      import('./pages/faq/faq.component').then((m) => m.FaqComponent),
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./pages/page-error/page-error.component').then(
        (m) => m.PageErrorComponent
      ),
  },
  {
    path: 'error/:code',
    loadComponent: () =>
      import('./pages/page-error/page-error.component').then(
        (m) => m.PageErrorComponent
      ),
  },
  // Wildcard route - must be last
  {
    path: '**',
    redirectTo: '/error'
  },
];


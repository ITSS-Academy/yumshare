import { createAction, props } from '@ngrx/store';
import { SearchResult } from './search.state';

export const search = createAction(
  '[Search] Search',
  props<{ keyword: string; selectedCategory: string }>()
);

export const searchSuccess = createAction(
  '[Search] Search Success',
  props<{ results: SearchResult[] }>()
);

export const goToPage = createAction(
  '[Search] Go To Page',
  props<{ page: number }>()
);

export const prevPage = createAction('[Search] Previous Page');

export const nextPage = createAction('[Search] Next Page');

export const toggleFavorite = createAction(
  '[Search] Toggle Favorite',
  props<{ result: SearchResult }>()
);

export const setupPagination = createAction('[Search] Setup Pagination');

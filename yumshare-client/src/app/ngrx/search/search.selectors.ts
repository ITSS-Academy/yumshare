import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SearchState } from './search.state';

export const selectSearchState = createFeatureSelector<SearchState>('search');

export const selectKeyword = createSelector(
  selectSearchState,
  (state: SearchState) => state.keyword
);

export const selectSelectedCategory = createSelector(
  selectSearchState,
  (state: SearchState) => state.selectedCategory
);

export const selectCategories = createSelector(
  selectSearchState,
  (state: SearchState) => state.categories
);

export const selectResults = createSelector(
  selectSearchState,
  (state: SearchState) => state.results
);

export const selectDisplayedResults = createSelector(
  selectSearchState,
  (state: SearchState) => state.displayedResults
);

export const selectCurrentPage = createSelector(
  selectSearchState,
  (state: SearchState) => state.currentPage
);

export const selectTotalPages = createSelector(
  selectSearchState,
  (state: SearchState) => state.totalPages
);

export const selectVisiblePages = createSelector(
  selectSearchState,
  (state: SearchState) => state.visiblePages
);

export const selectShowEllipsis = createSelector(
  selectSearchState,
  (state: SearchState) => state.showEllipsis
);

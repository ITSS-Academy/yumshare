import { createReducer, on } from '@ngrx/store';
import { SearchState, initialSearchState } from './search.state';
import * as SearchActions from './search.actions';

export const searchReducer = createReducer(
  initialSearchState,
  on(SearchActions.search, (state, { keyword, selectedCategory }) => ({
    ...state,
    keyword,
    selectedCategory,
  })),
  on(SearchActions.searchSuccess, (state, { results }) => {
    const totalPages = Math.ceil(results.length / state.pageSize);
    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    const displayedResults = results.slice(start, end);
    const maxVisible = 3;
    let startPage = Math.max(1, state.currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    return {
      ...state,
      results,
      displayedResults,
      totalPages,
      visiblePages,
      showEllipsis: totalPages > endPage,
    };
  }),
  on(SearchActions.goToPage, (state, { page }) => {
    const start = (page - 1) * state.pageSize;
    const end = start + state.pageSize;
    const displayedResults = state.results.slice(start, end);
    const maxVisible = 3;
    let startPage = Math.max(1, page - 1);
    let endPage = Math.min(state.totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    return {
      ...state,
      currentPage: page,
      displayedResults,
      visiblePages,
      showEllipsis: state.totalPages > endPage,
    };
  }),
  on(SearchActions.prevPage, (state) => {
    const newPage = state.currentPage > 1 ? state.currentPage - 1 : state.currentPage;
    const start = (newPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    const displayedResults = state.results.slice(start, end);
    const maxVisible = 3;
    let startPage = Math.max(1, newPage - 1);
    let endPage = Math.min(state.totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    return {
      ...state,
      currentPage: newPage,
      displayedResults,
      visiblePages,
      showEllipsis: state.totalPages > endPage,
    };
  }),
  on(SearchActions.nextPage, (state) => {
    const newPage = state.currentPage < state.totalPages ? state.currentPage + 1 : state.currentPage;
    const start = (newPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    const displayedResults = state.results.slice(start, end);
    const maxVisible = 3;
    let startPage = Math.max(1, newPage - 1);
    let endPage = Math.min(state.totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    return {
      ...state,
      currentPage: newPage,
      displayedResults,
      visiblePages,
      showEllipsis: state.totalPages > endPage,
    };
  }),
  on(SearchActions.toggleFavorite, (state, { result }) => {
    const updatedResults = state.results.map((item) =>
      item === result ? { ...item, isFavorite: !item.isFavorite } : item
    );
    const updatedDisplayedResults = state.displayedResults.map((item) =>
      item === result ? { ...item, isFavorite: !item.isFavorite } : item
    );
    return {
      ...state,
      results: updatedResults,
      displayedResults: updatedDisplayedResults,
    };
  }),
  on(SearchActions.setupPagination, (state) => {
    const totalPages = Math.ceil(state.results.length / state.pageSize);
    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    const displayedResults = state.results.slice(start, end);
    const maxVisible = 3;
    let startPage = Math.max(1, state.currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const visiblePages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
    return {
      ...state,
      totalPages,
      displayedResults,
      visiblePages,
      showEllipsis: totalPages > endPage,
    };
  })
);

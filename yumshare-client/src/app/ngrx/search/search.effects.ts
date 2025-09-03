import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import * as SearchActions from './search.actions';
import {initialSearchState, SearchState} from './search.state';

@Injectable()
export class SearchEffects {
  constructor(private actions$: Actions) {}

  search$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SearchActions.search),
      map(({ keyword, selectedCategory }) => {
        // Since initial data is in state, we filter it here.
        // In a real app, this could be an API call.
        const initialResults = initialSearchState.results;
        const filteredResults = initialResults.filter((item) => {
          const keywordLower = keyword.toLowerCase();
          const matchKeyword = keywordLower
            ? item.title.toLowerCase().includes(keywordLower) ||
            item.description.toLowerCase().includes(keywordLower) ||
            item.author.toLowerCase().includes(keywordLower)
            : true;
          const matchCategory = selectedCategory
            ? item.title.toLowerCase() === selectedCategory.toLowerCase()
            : true;
          return matchKeyword && matchCategory;
        });
        return SearchActions.searchSuccess({ results: filteredResults });
      })
    )
  );
}

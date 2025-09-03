import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Define SearchResult interface locally to avoid circular dependency
interface SearchResult {
  title: string;
  description: string;
  image: string;
  author: string;
  authorAvatar: string;
  rating: number;
  isFavorite: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private allResults: SearchResult[] = [
    {
      title: 'Salad',
      description: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      image: 'assets/salad.jpg',
      author: 'Anh Vu',
      authorAvatar: 'assets/avatar.png',
      rating: 4,
      isFavorite: false,
    },
    {
      title: 'Salad',
      description: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      image: 'assets/salad.jpg',
      author: 'Van Nghia',
      authorAvatar: 'assets/avatar.png',
      rating: 5,
      isFavorite: false,
    },
    {
      title: 'Soups',
      description: 'Soups',
      image: 'assets/soup.jpg',
      author: 'Quoc Viet',
      authorAvatar: 'assets/avatar.png',
      rating: 1,
      isFavorite: false,
    },
    {
      title: 'Soups',
      description: 'Soups',
      image: 'assets/soup.jpg',
      author: 'Quoc Viet',
      authorAvatar: 'assets/avatar.png',
      rating: 1,
      isFavorite: false,
    },
  ];

  search(keyword: string, selectedCategory: string): Observable<SearchResult[]> {
    const filteredResults = this.allResults.filter((item) => {
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
    return of(filteredResults);
  }
}

export interface SearchResult {
  title: string;
  description: string;
  image: string;
  author: string;
  authorAvatar: string;
  rating: number;
  isFavorite: boolean;
}

export interface SearchState {
  keyword: string;
  selectedCategory: string;
  categories: string[];
  results: SearchResult[];
  displayedResults: SearchResult[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  visiblePages: number[];
  showEllipsis: boolean;
}

export const initialSearchState: SearchState = {
  keyword: '',
  selectedCategory: '',
  categories: ['Salads', 'Soups', 'Desserts'],
  results: [
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
  ],
  displayedResults: [],
  currentPage: 1,
  totalPages: 0,
  pageSize: 8,
  visiblePages: [],
  showEllipsis: false,
};

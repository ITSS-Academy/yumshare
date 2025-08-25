import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCard, MatCardActions, MatCardContent, MatCardImage} from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {NgFor, NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-search',
  imports: [
    FormsModule,
    NgIf,
    NgFor,
    MatCard,
    MatCardContent,
    MatCardActions,
    MatIcon,
    MatIconButton,
    MatCardImage,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  keyword: string = '';
  selectedCategory: string = '';
  author: string = '';
  categories: string[] = ['Salads', 'Soups', 'Desserts'];


  results = [
      {
        title: 'Salad',
        description: 'Contrary to popular belief, Lorem Ipsum is not simply random text...',
        image: 'assets/salad.jpg',
        author: 'AnhVu-1904',
        authorAvatar: 'assets/avatar.png',
        rating: 4   // ⭐⭐⭐⭐☆
      },
    {
      title: 'Salad',
      description: 'Contrary to popular belief, Lorem Ipsum is not simply random text...',
      image: 'assets/salad.jpg',
      author: 'AnhVu-1904',
      authorAvatar: 'assets/avatar.png',
      rating: 4   // ⭐⭐⭐⭐☆
    },
    ];


  onSearch() {
    console.log('Search clicked:', this.keyword, this.selectedCategory, this.author);
  }
}

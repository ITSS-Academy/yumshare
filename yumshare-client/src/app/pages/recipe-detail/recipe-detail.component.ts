import { Component } from '@angular/core';
import {CommentComponent} from './component/comment/comment.component';
import {MatChip} from '@angular/material/chips';

@Component({
  selector: 'app-recipe-detail',
  imports: [
    CommentComponent,
    MatChip
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss'
})
export class RecipeDetailComponent {

}

import { Component } from '@angular/core';
import {CommentComponent} from './component/comment/comment.component';
import {MatChip} from '@angular/material/chips';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-recipe-detail',
  imports: [
    CommentComponent,
    MatChip,
    MatCheckbox,
    FormsModule
  ],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss'
})
export class RecipeDetailComponent {
  isFollowed = false;
}

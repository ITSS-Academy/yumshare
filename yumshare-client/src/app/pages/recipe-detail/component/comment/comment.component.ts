import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

interface Comment {
  id: number;
  userName: string;
  text: string;
  editing?: boolean;
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  imports: [
    FormsModule,
    MatButton
  ],
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  comments: Comment[] = [
    { id: 1, userName: 'User Name', text: 'Contrary to popular belief, Lorem Ipsum is not simply random text.' },
    { id: 2, userName: 'Another User', text: 'This is another sample comment styled like Facebook.' }
  ];
  newComment: string = '';
  editingText: string = '';

  addComment() {
    if (this.newComment.trim()) {
      this.comments.push({
        id: Date.now(),
        userName: 'You',
        text: this.newComment
      });
      this.newComment = '';
    }
  }

  startEdit(comment: Comment) {
    comment.editing = true;
    this.editingText = comment.text;
  }

  saveEdit(comment: Comment) {
    if (this.editingText.trim()) {
      comment.text = this.editingText;
      comment.editing = false;
    }
  }

  cancelEdit(comment: Comment) {
    comment.editing = false;
  }

  deleteComment(id: number) {
    this.comments = this.comments.filter(c => c.id !== id);
  }
}

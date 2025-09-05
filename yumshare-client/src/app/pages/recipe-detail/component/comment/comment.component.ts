import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil, combineLatest, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Comment } from '../../../../models/comment.model';
import { User } from '../../../../models/user.model';
import { CreateCommentDto, UpdateCommentDto } from '../../../../../app/services/comment/comment.service';

// NGRX imports
import * as CommentActions from '../../../../ngrx/comment/comment.actions';
import * as AuthActions from '../../../../ngrx/auth/auth.actions';

// Selectors
import { selectCommentsByRecipe, selectCommentsByRecipeLoading, selectCommentsByRecipeError, selectOperationLoading } from '../../../../ngrx/comment/comment.selectors';
import { selectCurrentUser } from '../../../../ngrx/auth/auth.selectors';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss'
})
export class CommentComponent implements OnInit, OnDestroy {
  @Input() recipeId: string = '';
  @Input() recipeTitle: string = '';
  @Input() recipeOwnerId: string = '';
  @Output() commentAdded = new EventEmitter<Comment>();
  @Output() commentDeleted = new EventEmitter<string>();

  private destroy$ = new Subject<void>();
  
  // Comment data
  comments$: Observable<Comment[]>;
  commentsLoading$: Observable<boolean>;
  commentsError$: Observable<string | null>;
  operationLoading$: Observable<boolean>;
  
  // Auth data
  currentUser$: Observable<any | null>;
  
  // Local state
  newCommentContent: string = '';
  editingCommentId: string | null = null;
  editingContent: string = '';
  activeMenuId: string | null = null;
  
  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    // Initialize observables
    this.comments$ = this.store.select(selectCommentsByRecipe);
    this.commentsLoading$ = this.store.select(selectCommentsByRecipeLoading);
    this.commentsError$ = this.store.select(selectCommentsByRecipeError);
    this.operationLoading$ = this.store.select(selectOperationLoading);
    
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Handle comment errors
    this.commentsError$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.snackBar.open(`Error loading comments: ${error}`, 'Close', { duration: 3000 });
      }
    });

    // Handle operation success
    this.operationLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      if (!loading) {
        // Operation completed, could show success message
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmitComment(): void {
    if (!this.newCommentContent.trim() || !this.recipeId) return;
    
          // Kiểm tra đăng nhập trước - sử dụng take(1) để chỉ lấy giá trị hiện tại
      this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
        if (!currentUser || !currentUser.uid) {
          // Chưa đăng nhập - chỉ hiển thị thông báo
          this.snackBar.open('Vui lòng đăng nhập để bình luận!', 'Đăng nhập', { 
            duration: 4000,
            panelClass: ['warning-snackbar']
          });
          return;
        }
        
        // Đã đăng nhập - tiếp tục logic comment
        const commentData: CreateCommentDto = {
          user_id: currentUser.uid,
          recipe_id: this.recipeId,
          content: this.newCommentContent.trim()
        };
        
        this.store.dispatch(CommentActions.createComment({ commentData }));
      this.newCommentContent = '';
      
      // Note: Notification is automatically created by backend when comment is created
      // No need to call notification helper from frontend
      
      // Force reload comments after creating
      setTimeout(() => {
        this.store.dispatch(CommentActions.loadCommentsByRecipe({ recipeId: this.recipeId }));
      }, 1000);
      
      // Emit event to parent component
      this.commentAdded.emit(commentData as any);
    });
  }

  onEditComment(comment: Comment): void {
    // Kiểm tra đăng nhập trước
    this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
      if (!currentUser || !currentUser.uid) {
        this.snackBar.open('Vui lòng đăng nhập để chỉnh sửa bình luận!', 'Đăng nhập', { 
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      
      // Kiểm tra xem user có phải là người tạo comment không
      if (currentUser.uid !== comment.user_id) {
        this.snackBar.open('Bạn không có quyền chỉnh sửa bình luận này!', 'Đóng', { 
          duration: 3000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      
      this.editingCommentId = comment.id;
      this.editingContent = comment.content;
      this.activeMenuId = null; // Close menu when starting edit
    });
  }

  onSaveEdit(): void {
    if (!this.editingCommentId || !this.editingContent.trim()) return;
    
    // Kiểm tra đăng nhập trước
    this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
      if (!currentUser || !currentUser.uid) {
        this.snackBar.open('Vui lòng đăng nhập để chỉnh sửa bình luận!', 'Đăng nhập', { 
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      
      const commentData: UpdateCommentDto = {
        content: this.editingContent.trim()
      };
      
      this.store.dispatch(CommentActions.updateComment({ 
        id: this.editingCommentId!, 
        commentData 
      }));
      
      // Reset editing state
      this.cancelEdit();
      
      // Force reload comments after update
      setTimeout(() => {
        this.store.dispatch(CommentActions.loadCommentsByRecipe({ recipeId: this.recipeId }));
      }, 1000);
    });
  }

  onCancelEdit(): void {
    this.cancelEdit();
  }

  private cancelEdit(): void {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  onDeleteComment(commentId: string): void {
    // Kiểm tra đăng nhập trước
    this.currentUser$.pipe(take(1)).subscribe((currentUser: any) => {
      if (!currentUser || !currentUser.uid) {
        this.snackBar.open('Vui lòng đăng nhập để xóa bình luận!', 'Đăng nhập', { 
          duration: 4000,
          panelClass: ['warning-snackbar']
        });
        return;
      }
      
      // Tìm comment để kiểm tra quyền
      this.comments$.pipe(take(1)).subscribe((comments: Comment[]) => {
        const comment = comments.find(c => c.id === commentId);
        
        if (!comment) {
          return;
        }
        
        // Kiểm tra xem user có phải là người tạo comment không
        if (currentUser.uid !== comment.user_id) {
          this.snackBar.open('Bạn không có quyền xóa bình luận này!', 'Đóng', { 
            duration: 3000,
            panelClass: ['warning-snackbar']
          });
          return;
        }
        
        if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
          this.store.dispatch(CommentActions.deleteComment({ id: commentId }));
          
          // Emit event to parent component
          this.commentDeleted.emit(commentId);
          
          // Close menu after delete
          this.activeMenuId = null;
        }
      });
    });
  }

  onRetry(): void {
    // This method will be called when user clicks retry button
    // The parent component should handle reloading comments
    this.commentAdded.emit({} as Comment);
  }

  onCommentAdded(comment: Comment): void {
    // This method will be called when a comment is added
    // The parent component should handle reloading comments
    this.commentAdded.emit(comment);
  }

  onCommentDeleted(commentId: string): void {
    // This method will be called when a comment is deleted
    // The parent component should handle reloading comments
    this.commentDeleted.emit(commentId);
  }

  trackByCommentId(index: number, comment: Comment): string {
    return comment.id;
  }

  // Helper methods for template
  toggleMenu(commentId: string): void {
    if (this.activeMenuId === commentId) {
      this.activeMenuId = null;
    } else {
      this.activeMenuId = commentId;
    }
  }

  canEdit(comment: Comment, currentUser: any | null): boolean {
    return currentUser?.uid === comment.user_id;
  }

  canDelete(comment: Comment, currentUser: any | null): boolean {
    return currentUser?.uid === comment.user_id;
  }

  isEditing(commentId: string): boolean {
    return this.editingCommentId === commentId;
  }

  getTimeAgo(date: Date | string): string {
    try {
      const now = new Date();
      
      // Convert database UTC time to local time
      let commentDate: Date;
      if (typeof date === 'string') {
        // Database time is UTC, convert to local
        // If the string doesn't have 'Z' suffix, add it to indicate UTC
        const dateStr = date.includes('Z') ? date : date + 'Z';
        commentDate = new Date(dateStr);
      } else {
        commentDate = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(commentDate.getTime())) {
        return 'Unknown time';
      }
      
      // Calculate difference in seconds
      const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);
      
      // WORKAROUND: If the time difference is suspiciously large (> 6 hours),
      // it might be a backend timezone issue. Show a more user-friendly message.
      if (diffInSeconds > 21600) { // 6 hours
        const hours = Math.floor(diffInSeconds / 3600);
        if (hours < 24) {
          return `${hours} giờ trước`;
        } else {
          const days = Math.floor(hours / 24);
          return `${days} ngày trước`;
        }
      }
      
      if (diffInSeconds < 0) {
        return commentDate.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      if (diffInSeconds < 60) return 'Vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
      
      return commentDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown time';
    }
  }

  getUserDisplayName(comment: Comment): string {
    // Check if user data is flattened directly in comment (backend response structure)
    if (comment.username) {
      return comment.username;
    }
    
    // Try to get username from user relation first
    if (comment.user?.username) {
      return comment.user.username;
    }
    
    // If no user relation, show user ID as fallback
    if (comment.user_id) {
      return `User ${comment.user_id.substring(0, 8)}...`;
    }
    
    return 'Anonymous User';
  }

  getUserAvatar(comment: Comment): string {
    // Try to get avatar from flattened comment data first
    if (comment.avatar_url) {
      return comment.avatar_url;
    }
    
    // Try to get avatar from user relation first
    if (comment.user?.avatar_url) {
      return comment.user.avatar_url;
    }
    
    // Fallback to default avatar
    return 'assets/default-avatar.png';
  }

  private onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    const commentMenu = document.querySelector('.comment-menu');
    
    // Close menu when clicking outside
    if (commentMenu && !commentMenu.contains(target)) {
      this.activeMenuId = null;
    }
  }
}

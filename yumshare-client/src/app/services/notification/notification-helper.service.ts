import { inject, Injectable } from '@angular/core';
import { NotificationService, CreateNotificationDto } from './notification.service';
import { NotificationType } from '../../models/notification.model';
import {TranslateService, _} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class NotificationHelperService {
  private translate = inject(TranslateService);

  constructor(private notificationService: NotificationService) {}

  /**
   * Tạo notification khi ai đó like recipe
   */
  createLikeNotification(recipeOwnerId: string, likerName: string, recipeTitle: string, recipeId: string): void {
    const notification: CreateNotificationDto = {
      user_id: recipeOwnerId,
      type: NotificationType.LIKE,
      content: `${likerName} liked your recipe "${recipeTitle}"`,
      metadata: { recipe_id: recipeId }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating like notification:', err)
    });
  }

  /**
   * Tạo notification khi ai đó comment vào recipe
   */
  createCommentNotification(recipeOwnerId: string, commenterName: string, recipeTitle: string, recipeId: string, commentId: string): void {
    const notification: CreateNotificationDto = {
      user_id: recipeOwnerId,
      type: NotificationType.COMMENT,
      content: `${commenterName} commented on your recipe "${recipeTitle}"`,
      metadata: { recipe_id: recipeId, comment_id: commentId }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating comment notification:', err)
    });
  }

  /**
   * Tạo notification khi ai đó follow user
   */
  createFollowNotification(userId: string, followerName: string, followerId: string): void {
    const notification: CreateNotificationDto = {
      user_id: userId,
      type: NotificationType.FOLLOW,
      content: `${followerName} started following you`,
      metadata: { follower_id: followerId }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating follow notification:', err)
    });
  }

  /**
   * Tạo notification khi recipe được approve
   */
  createRecipeApprovedNotification(userId: string, recipeTitle: string, recipeId: string): void {
    const notification: CreateNotificationDto = {
      user_id: userId,
      type: NotificationType.RECIPE_APPROVED,
      content: `Your recipe "${recipeTitle}" has been approved!`,
      metadata: { recipe_id: recipeId }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating recipe approved notification:', err)
    });
  }

  /**
   * Tạo notification khi recipe bị reject
   */
  createRecipeRejectedNotification(userId: string, recipeTitle: string, recipeId: string, reason?: string): void {
    const content = reason 
      ? `Your recipe "${recipeTitle}" was rejected: ${reason}`
      : `Your recipe "${recipeTitle}" was rejected`;
      
    const notification: CreateNotificationDto = {
      user_id: userId,
      type: NotificationType.RECIPE_REJECTED,
      content,
      metadata: { recipe_id: recipeId }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating recipe rejected notification:', err)
    });
  }

  /**
   * Tạo notification khi recipe được share
   */
  createRecipeSharedNotification(userId: string, sharerName: string, recipeTitle: string, recipeId: string): void {
    const notification: CreateNotificationDto = {
      user_id: userId,
      type: NotificationType.RECIPE_SHARED,
      content: `${sharerName} shared your recipe "${recipeTitle}"`,
      metadata: { recipe_id: recipeId }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating recipe shared notification:', err)
    });
  }

  /**
   * Tạo system notification
   */
  createSystemNotification(userId: string, content: string, metadata?: any): void {
    const notification: CreateNotificationDto = {
      user_id: userId,
      type: NotificationType.SYSTEM,
      content,
      metadata
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating system notification:', err)
    });
  }

  /**
   * Tạo notification khi có tin nhắn mới
   */
  createNewMessageNotification(recipientId: string, senderName: string, messageContent: string, chatId: string): void {
   this.translate.get(_('sent_you_a_message')).subscribe((res: string) => {
    console.log(res);
    
      const notification: CreateNotificationDto = {
      user_id: recipientId,
      type: NotificationType.SYSTEM, // Hoặc tạo type MESSAGE mới
      content: `${senderName} ${res} ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
      metadata: { chat_id: chatId }
    };
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating message notification:', err)
    });
    });
  }

  /**
   * Tạo notification khi người được follow đăng recipe mới
   */
  createNewRecipeNotification(followerId: string, authorName: string, recipeTitle: string, recipeId: string, authorId: string): void {
    const notification: CreateNotificationDto = {
      user_id: followerId,
      type: NotificationType.NEW_RECIPE,
      content: `${authorName} đã đăng công thức mới: "${recipeTitle}"`,
      metadata: { 
        recipe_id: recipeId,
        author_id: authorId,
        author_name: authorName,
        recipe_title: recipeTitle,
        notification_type: 'new_recipe'
      }
    };
    
    this.notificationService.createNotification(notification).subscribe({
      error: (err) => console.error('Error creating new recipe notification:', err)
    });
  }
}

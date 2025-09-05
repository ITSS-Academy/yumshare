import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../auth/entities/user.entity';
import { NotificationGateway } from './notifications.gateway';
import { FollowsService } from '../follows/follows.service';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    @Inject(forwardRef(() => FollowsService))
    private readonly followsService: FollowsService,
  ) {}

  async create(createDto: CreateNotificationDto) {
    const user = await this.userRepository.findOne({ where: { id: createDto.user_id } });
    if (!user) throw new Error('User not found');
    
    const notification = this.notificationRepository.create({
      user,
      type: createDto.type,
      content: createDto.content,
      metadata: createDto.metadata,
    });
    
    const savedNotification = await this.notificationRepository.save(notification);
    
    // Gửi real-time notification
    this.notificationGateway.sendNotificationToUser(createDto.user_id, {
      id: savedNotification.id,
      type: savedNotification.type,
      content: savedNotification.content,
      is_read: savedNotification.is_read,
      created_at: savedNotification.created_at,
      user_id: createDto.user_id
    });
    
    return savedNotification;
  }

  findAll() {
    return this.notificationRepository.find({ relations: ['user'] });
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { created_at: 'DESC' }
    });
  }

  findOne(id: string) {
    return this.notificationRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async update(id: string, updateDto: UpdateNotificationDto) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) return null;
    Object.assign(notification, updateDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: string) {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) return null;
    await this.notificationRepository.remove(notification);
    return { deleted: true };
  }

  async markAllAsRead() {
    await this.notificationRepository.update({ is_read: false }, { is_read: true });
    return this.notificationRepository.find({ relations: ['user'] });
  }

  /**
   * Gửi thông báo cho tất cả followers khi có recipe mới
   */
  async notifyFollowersNewRecipe(authorId: string, recipeData: { id: string; title: string; authorName: string }) {
    try {
      // Lấy danh sách followers của author
      const followersResult = await this.followsService.getFollowers(authorId, 1, 1000); // Lấy tối đa 1000 followers
      const followers = followersResult.data;

      if (followers.length === 0) {
        return { message: 'No followers to notify' };
      }

      // Tạo thông báo cho từng follower
      const notificationPromises = followers.map(async (follow) => {
        const followerId = follow.follower_id;
        
        const notificationDto: CreateNotificationDto = {
          user_id: followerId,
          type: NotificationType.NEW_RECIPE,
          content: `${recipeData.authorName} đã đăng công thức mới: "${recipeData.title}"`,
          metadata: {
            recipe_id: recipeData.id,
            author_id: authorId,
            author_name: recipeData.authorName,
            recipe_title: recipeData.title,
            notification_type: 'new_recipe'
          }
        };

        return this.create(notificationDto);
      });

      // Gửi tất cả thông báo
      await Promise.all(notificationPromises);

      return { 
        message: `Notifications sent to ${followers.length} followers`,
        followersCount: followers.length
      };
    } catch (error) {
      console.error('Error notifying followers about new recipe:', error);
      throw new Error('Failed to notify followers about new recipe');
    }
  }
} 
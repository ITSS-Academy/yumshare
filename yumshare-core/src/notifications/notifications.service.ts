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
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check for duplicate notification within last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingNotification = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user.id = :userId', { userId: createDto.user_id })
      .andWhere('notification.type = :type', { type: createDto.type })
      .andWhere('notification.content = :content', { content: createDto.content })
      .andWhere('notification.created_at >= :fiveMinutesAgo', { fiveMinutesAgo })
      .getOne();

    if (existingNotification) {
      return existingNotification;
    }
    
    const notification = this.notificationRepository.create({
      user,
      type: createDto.type,
      content: createDto.content,
      metadata: createDto.metadata,
    });
    
    const savedNotification = await this.notificationRepository.save(notification);
    
    // Gửi real-time notification
    const notificationData = {
      id: savedNotification.id,
      type: savedNotification.type,
      content: savedNotification.content,
      is_read: savedNotification.is_read,
      created_at: savedNotification.created_at, // Sử dụng thời gian từ database (đã được convert)
      user_id: createDto.user_id
    };
    
    this.notificationGateway.sendNotificationToUser(createDto.user_id, notificationData);
    
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

  async getUserNotificationCounts(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { user: { id: userId } }
    });

    const unreadCount = notifications.filter(n => !n.is_read && n.type !== NotificationType.MESSAGE).length;
    const messageCount = notifications.filter(n => !n.is_read && n.type === NotificationType.MESSAGE).length;
    const totalCount = notifications.length;

    return {
      unreadCount,
      messageCount,
      totalCount
    };
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

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user: { id: userId }, is_read: false }, 
      { is_read: true }
    );
    return this.notificationRepository.find({ 
      where: { user: { id: userId } },
      relations: ['user'] 
    });
  }

  async getOnlineUsers() {
    return this.notificationGateway.getOnlineUsers();
  }

  /**
   * Gửi thông báo cho tất cả followers khi có recipe mới
   */
  async notifyFollowersNewRecipe(authorId: string, recipeData: { id: string; title: string; authorName: string }) {
    try {
      // Lấy danh sách followers của author
      const followersResult = await this.followsService.getFollowers(authorId, 1, 100); // Lấy tối đa 1000 followers
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
          content: `${recipeData.authorName} posted a new recipe: "${recipeData.title}"`,
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
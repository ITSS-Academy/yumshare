import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createDto: CreateNotificationDto) {
    const user = await this.userRepository.findOne({ where: { id: createDto.user_id } });
    if (!user) throw new Error('User not found');
    const notification = this.notificationRepository.create({
      user,
      type: createDto.type,
      content: createDto.content,
    });
    return this.notificationRepository.save(notification);
  }

  findAll() {
    return this.notificationRepository.find({ relations: ['user'] });
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
} 
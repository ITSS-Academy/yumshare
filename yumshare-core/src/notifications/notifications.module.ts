import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationGateway } from './notifications.gateway';
import { Notification } from './entities/notification.entity';
import { User } from '../auth/entities/user.entity';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    forwardRef(() => FollowsModule)
  ],
  providers: [NotificationsService, NotificationGateway],
  controllers: [NotificationsController],
  exports: [NotificationGateway, NotificationsService]
})
export class NotificationsModule {} 
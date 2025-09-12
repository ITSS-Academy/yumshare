import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { Follow } from './entities/follow.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
    forwardRef(() => NotificationsModule)
  ],
  providers: [FollowsService],
  controllers: [FollowsController],
  exports: [FollowsService]
})
export class FollowsModule {}

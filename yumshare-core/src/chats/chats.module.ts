import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { ChatsGateway } from './chats.gateway';
import { Chat } from './entities/chat.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { User } from '../auth/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage, User]),
    forwardRef(() => NotificationsModule)
  ],
  providers: [ChatsService, ChatsGateway],
  controllers: [ChatsController],
  exports: [ChatsService]
})
export class ChatsModule {}

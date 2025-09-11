import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chats')
@UseGuards(RateLimitGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  createChat(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.createChat(createChatDto);
  }

  @Get('user/:userId')
  getUserChats(@Param('userId') userId: string) {
    return this.chatsService.getUserChats(userId);
  }

  @Get(':chatId/messages')
  getChatMessages(
    @Param('chatId') chatId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    return this.chatsService.getChatMessages(chatId, pageNum, limitNum);
  }



  @Post('messages')
  sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.chatsService.sendMessage(createMessageDto);
  }

  @Post('messages/:messageId/read')
  markMessageAsRead(@Param('messageId') messageId: string) {
    return this.chatsService.markMessageAsRead(messageId);
  }

  @Post(':chatId/read')
  markChatAsRead(
    @Param('chatId') chatId: string,
    @Body() body: { userId: string }
  ) {
    return this.chatsService.markChatAsRead(chatId, body.userId);
  }

  @Get('unread/:userId')
  getUnreadMessageCount(@Param('userId') userId: string) {
    return this.chatsService.getUnreadMessageCount(userId);
  }

  @Get('search/:userId')
  searchMessages(@Param('userId') userId: string, @Query('q') query: string) {
    return this.chatsService.searchMessages(userId, query);
  }
}

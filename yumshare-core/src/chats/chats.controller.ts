import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('chats')
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
  getChatMessages(@Param('chatId') chatId: string) {
    return this.chatsService.getChatMessages(chatId);
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

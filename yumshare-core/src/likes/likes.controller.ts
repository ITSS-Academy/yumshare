import { Controller, Post, Delete, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';

@Controller('likes')
@UseGuards(RateLimitGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  likeRecipe(@Body() createLikeDto: CreateLikeDto) {
    return this.likesService.likeRecipe(createLikeDto);
  }

  @Delete(':userId/:recipeId')
  unlikeRecipe(
    @Param('userId') userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.likesService.unlikeRecipe(userId, recipeId);
  }

  @Get('recipe/:recipeId')
  getRecipeLikes(@Param('recipeId') recipeId: string) {
    return this.likesService.getRecipeLikes(recipeId);
  }

  @Get('user/:userId')
  getUserLikes(@Param('userId') userId: string) {
    return this.likesService.getUserLikes(userId);
  }

  @Get('check/:userId/:recipeId')
  checkIfLiked(
    @Param('userId') userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.likesService.isRecipeLikedByUser(userId, recipeId);
  }

  @Get('count/:recipeId')
  getRecipeLikeCount(@Param('recipeId') recipeId: string) {
    return this.likesService.getRecipeLikeCount(recipeId);
  }
}

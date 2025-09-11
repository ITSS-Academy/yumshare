import { Controller, Post, Delete, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryOptsDto } from '../common/dto/query-opts.dto';

@Controller('favorites')
@UseGuards(RateLimitGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  addToFavorites(@Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.addToFavorites(createFavoriteDto);
  }

  @Delete(':userId/:recipeId')
  removeFromFavorites(
    @Param('userId') userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.favoritesService.removeFromFavorites(userId, recipeId);
  }

  @Get('user/:userId')
  getUserFavorites(
    @Param('userId') userId: string,
    @Query() queryOpts: QueryOptsDto,
  ) {
    return this.favoritesService.getUserFavorites(userId, queryOpts);
  }

  @Get('check/:userId/:recipeId')
  checkIfInFavorites(
    @Param('userId') userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.favoritesService.isInFavorites(userId, recipeId);
  }

  @Get('count/:userId')
  getFavoriteCount(@Param('userId') userId: string) {
    return this.favoritesService.getFavoriteCount(userId);
  }
}

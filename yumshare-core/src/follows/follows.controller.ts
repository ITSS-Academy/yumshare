import { Controller, Post, Delete, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';

@Controller('follows')
@UseGuards(RateLimitGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @RateLimit(RateLimits.STRICT)
  followUser(@Body() createFollowDto: CreateFollowDto) {
    return this.followsService.followUser(createFollowDto);
  }

  @Delete(':followerId/:followingId')
  @RateLimit(RateLimits.STRICT)
  unfollowUser(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followsService.unfollowUser(followerId, followingId);
  }

  @Get('followers/:userId')
  @RateLimit(RateLimits.STANDARD)
  getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.followsService.getFollowers(userId, page, limit);
  }

  @Get('following/:userId')
  @RateLimit(RateLimits.STANDARD)
  getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.followsService.getFollowing(userId, page, limit);
  }

  @Get('check/:followerId/:followingId')
  @RateLimit(RateLimits.STANDARD)
  checkIfFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followsService.isFollowing(followerId, followingId);
  }

  @Get('count/followers/:userId')
  @RateLimit(RateLimits.STANDARD)
  getFollowerCount(@Param('userId') userId: string) {
    return this.followsService.getFollowerCount(userId);
  }

  @Get('count/following/:userId')
  @RateLimit(RateLimits.STANDARD)
  getFollowingCount(@Param('userId') userId: string) {
    return this.followsService.getFollowingCount(userId);
  }


}

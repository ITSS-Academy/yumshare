import { Controller, Post, Delete, Get, Param, Body, Query } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';

@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  followUser(@Body() createFollowDto: CreateFollowDto) {
    return this.followsService.followUser(createFollowDto);
  }

  @Delete(':followerId/:followingId')
  unfollowUser(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followsService.unfollowUser(followerId, followingId);
  }

  @Get('followers/:userId')
  getFollowers(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.followsService.getFollowers(userId, page, limit);
  }

  @Get('following/:userId')
  getFollowing(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.followsService.getFollowing(userId, page, limit);
  }

  @Get('check/:followerId/:followingId')
  checkIfFollowing(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string,
  ) {
    return this.followsService.isFollowing(followerId, followingId);
  }

  @Get('count/followers/:userId')
  getFollowerCount(@Param('userId') userId: string) {
    return this.followsService.getFollowerCount(userId);
  }

  @Get('count/following/:userId')
  getFollowingCount(@Param('userId') userId: string) {
    return this.followsService.getFollowingCount(userId);
  }


}

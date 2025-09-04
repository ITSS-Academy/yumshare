import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async followUser(createFollowDto: CreateFollowDto) {
    // Check if users exist
    const follower = await this.userRepository.findOne({ where: { id: createFollowDto.follower_id } });
    const following = await this.userRepository.findOne({ where: { id: createFollowDto.following_id } });

    if (!follower || !following) {
      throw new NotFoundException('User not found');
    }

    // Check if already following
    const existingFollow = await this.followRepository.findOne({
      where: { follower_id: createFollowDto.follower_id, following_id: createFollowDto.following_id }
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    // Check if trying to follow self
    if (createFollowDto.follower_id === createFollowDto.following_id) {
      throw new BadRequestException('Cannot follow yourself');
    }

    // Create follow
    const follow = this.followRepository.create(createFollowDto);
    const savedFollow = await this.followRepository.save(follow);
    
    return {
      ...savedFollow,
      message: 'Successfully followed user'
    };
  }

  async unfollowUser(followerId: string, followingId: string) {
    const follow = await this.followRepository.findOne({
      where: { follower_id: followerId, following_id: followingId }
    });

    if (!follow) {
      throw new BadRequestException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
    return { message: 'Unfollowed successfully' };
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    

    
    // Try using raw query to load relations
    const followers = await this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'follower')
      .where('follow.following_id = :userId', { userId })
      .orderBy('follow.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const total = await this.followRepository.count({
      where: { following_id: userId }
    });



    return {
      data: followers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    

    
    // Try using raw query to load relations
    const following = await this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.following', 'following')
      .where('follow.follower_id = :userId', { userId })
      .orderBy('follow.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    const total = await this.followRepository.count({
      where: { follower_id: userId }
    });



    return {
      data: following,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { follower_id: followerId, following_id: followingId }
    });
    return !!follow;
  }

  async getFollowerCount(userId: string): Promise<number> {
    return this.followRepository.count({ where: { following_id: userId } });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.followRepository.count({ where: { follower_id: userId } });
  }


}

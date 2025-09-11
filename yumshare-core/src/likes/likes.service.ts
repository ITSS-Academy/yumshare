import { Injectable, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly logger = new Logger(LikesService.name);

  async likeRecipe(createLikeDto: CreateLikeDto) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: createLikeDto.user_id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if recipe exists with user relation
    const recipe = await this.recipeRepository.findOne({ 
      where: { id: createLikeDto.recipe_id },
      relations: ['user']
    });
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }

    // Check if already liked
    const existingLike = await this.likeRepository.findOne({
      where: { user_id: createLikeDto.user_id, recipe_id: createLikeDto.recipe_id }
    });

    if (existingLike) {
      throw new BadRequestException('Recipe already liked by this user');
    }

    // Create like
    const like = this.likeRepository.create(createLikeDto);
    const savedLike = await this.likeRepository.save(like);

    // Create notification for recipe owner (if not liking own recipe)
    if (recipe.user.id !== createLikeDto.user_id) {
      try {
        await this.notificationsService.create({
          user_id: recipe.user.id,
          type: NotificationType.LIKE,
          content: `${user.username || user.email} liked your recipe "${recipe.title}"`,
          metadata: {
            recipe_id: recipe.id,
            like_id: savedLike.id
          }
        });
      } catch (error) {
        this.logger.error('Error creating like notification:', error);
        // Don't throw error to avoid breaking like creation
      }
    }

    return savedLike;
  }

  async unlikeRecipe(userId: string, recipeId: string) {
    const like = await this.likeRepository.findOne({
      where: { user_id: userId, recipe_id: recipeId }
    });

    if (!like) {
      throw new BadRequestException('Like not found');
    }

    await this.likeRepository.remove(like);
    return { message: 'Recipe unliked successfully' };
  }

  async getRecipeLikes(recipeId: string) {
    return this.likeRepository.find({
      where: { recipe_id: recipeId },
      relations: ['user'],
      select: ['id', 'created_at', 'user_id']
    });
  }

  async getUserLikes(userId: string) {
    return this.likeRepository.find({
      where: { user_id: userId },
      relations: ['recipe'],
      select: ['id', 'created_at', 'recipe_id']
    });
  }

  async isRecipeLikedByUser(userId: string, recipeId: string): Promise<boolean> {
    const like = await this.likeRepository.findOne({
      where: { user_id: userId, recipe_id: recipeId }
    });
    return !!like;
  }

  async getRecipeLikeCount(recipeId: string): Promise<number> {
    return this.likeRepository.count({ where: { recipe_id: recipeId } });
  }
}

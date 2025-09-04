import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async likeRecipe(createLikeDto: CreateLikeDto) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: createLikeDto.user_id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if recipe exists
    const recipe = await this.recipeRepository.findOne({ where: { id: createLikeDto.recipe_id } });
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
    return this.likeRepository.save(like);
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

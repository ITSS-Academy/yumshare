import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async addToFavorites(createFavoriteDto: CreateFavoriteDto) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: createFavoriteDto.user_id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if recipe exists
    const recipe = await this.recipeRepository.findOne({ where: { id: createFavoriteDto.recipe_id } });
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }

    // Check if already in favorites
    const existingFavorite = await this.favoriteRepository.findOne({
      where: { user_id: createFavoriteDto.user_id, recipe_id: createFavoriteDto.recipe_id }
    });

    if (existingFavorite) {
      throw new BadRequestException('Recipe already in favorites');
    }

    // Add to favorites
    const favorite = this.favoriteRepository.create(createFavoriteDto);
    return this.favoriteRepository.save(favorite);
  }

  async removeFromFavorites(userId: string, recipeId: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: { user_id: userId, recipe_id: recipeId }
    });

    if (!favorite) {
      throw new BadRequestException('Favorite not found');
    }

    await this.favoriteRepository.remove(favorite);
    return { message: 'Recipe removed from favorites successfully' };
  }

  async getUserFavorites(userId: string) {
    return this.favoriteRepository.find({
      where: { user_id: userId },
      relations: ['recipe'],
      select: ['id', 'created_at', 'recipe_id']
    });
  }

  async isInFavorites(userId: string, recipeId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findOne({
      where: { user_id: userId, recipe_id: recipeId }
    });
    return !!favorite;
  }

  async getFavoriteCount(userId: string): Promise<number> {
    return this.favoriteRepository.count({ where: { user_id: userId } });
  }
}

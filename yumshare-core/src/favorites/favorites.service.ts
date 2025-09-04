import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { ListResult } from '../common/types/list-result.type';

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

  async getUserFavorites(userId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Favorite>> {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [favorites, total] = await this.favoriteRepository.findAndCount({
      where: { user_id: userId },
      relations: ['recipe', 'recipe.user', 'recipe.category'],
      order: { [orderBy]: order },
      skip,
      take: size,
    });
    
    return new ListResult(favorites, total, page, size);
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

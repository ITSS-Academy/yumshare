import { Injectable, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { ListResult } from '../common/types/list-result.type';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly logger = new Logger(FavoritesService.name);

  async addToFavorites(createFavoriteDto: CreateFavoriteDto) {
    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: createFavoriteDto.user_id } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if recipe exists with user relation
    const recipe = await this.recipeRepository.findOne({ 
      where: { id: createFavoriteDto.recipe_id },
      relations: ['user']
    });
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
    const savedFavorite = await this.favoriteRepository.save(favorite);

    // Create notification for recipe owner (if not favoriting own recipe)
    if (recipe.user.id !== createFavoriteDto.user_id) {
      try {
        await this.notificationsService.create({
          user_id: recipe.user.id,
          type: NotificationType.SYSTEM, // Temporarily use SYSTEM until database enum is updated
          content: `${user.username || user.email} added your recipe "${recipe.title}" to favorites`,
          metadata: {
            recipe_id: recipe.id,
            favorite_id: savedFavorite.id,
            notification_type: 'favorite' // Add this to distinguish from other system notifications
          }
        });
      } catch (error) {
        this.logger.error('Error creating favorite notification:', error);
        // Don't throw error to avoid breaking favorite creation
      }
    }

    return savedFavorite;
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
    const { 
      page = 1, 
      size = 10, 
      orderBy = 'created_at', 
      order = 'DESC',
      category,
      difficulty,
      query
    } = queryOpts;
    
    const skip = (page - 1) * size;
    
    let qb = this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.recipe', 'recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      .where('favorite.user_id = :userId', { userId });

    // Search query
    if (query) {
      qb = qb.andWhere(
        '(recipe.title ILIKE :query OR recipe.description ILIKE :query OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(recipe.ingredients) x WHERE x ILIKE :query))',
        { query: `%${query}%` }
      );
    }

    // Category filter
    if (category) {
      if (/^[0-9a-fA-F-]{36}$/.test(category)) {
        qb = qb.andWhere('category.id = :categoryId', { categoryId: category });
      } else {
        qb = qb.andWhere('category.name ILIKE :categoryName', { categoryName: `%${category}%` });
      }
    }

    // Difficulty filter
    if (difficulty) {
      qb = qb.andWhere('recipe.difficulty = :difficulty', { difficulty });
    }

    // Rating filter
   

    const [favorites, total] = await qb
      .orderBy(`favorite.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(size)
      .getManyAndCount();
    
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

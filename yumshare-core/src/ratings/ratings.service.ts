import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto/update-rating.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createRatingDto: CreateRatingDto) {
    const user = await this.userRepository.findOne({ where: { id: createRatingDto.user_id } });
    const recipe = await this.recipeRepository.findOne({ where: { id: createRatingDto.recipe_id } });
    if (!user || !recipe) throw new Error('User or Recipe not found');
    const rating = this.ratingRepository.create({
      user,
      recipe,
      rating: createRatingDto.rating,
    });
    return this.ratingRepository.save(rating);
  }

  findAll() {
    return this.ratingRepository.find({ 
      relations: ['user', 'recipe'],
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          username: true,
          avatar_url: true
        },
        recipe: {
          id: true,
          title: true,
          image_url: true
        }
      }
    });
  }

  findOne(id: string) {
    return this.ratingRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'recipe'],
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          username: true,
          avatar_url: true
        },
        recipe: {
          id: true,
          title: true,
          image_url: true
        }
      }
    });
  }

  async update(id: string, updateRatingDto: UpdateRatingDto) {
    const rating = await this.ratingRepository.findOne({ where: { id } });
    if (!rating) return null;
    Object.assign(rating, updateRatingDto);
    return this.ratingRepository.save(rating);
  }

  async remove(id: string) {
    const rating = await this.ratingRepository.findOne({ where: { id } });
    if (!rating) return null;
    await this.ratingRepository.remove(rating);
    return { deleted: true };
  }
}

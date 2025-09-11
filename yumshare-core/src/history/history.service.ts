import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './entities/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createDto: CreateHistoryDto) {
    const user = await this.userRepository.findOne({ where: { id: createDto.user_id } });
    const recipe = await this.recipeRepository.findOne({ where: { id: createDto.recipe_id } });
    if (!user || !recipe) throw new Error('User or Recipe not found');
    const history = this.historyRepository.create({ user, recipe });
    return this.historyRepository.save(history);
  }

  findAll() {
    return this.historyRepository.find({ 
      relations: ['user', 'recipe'],
      select: {
        id: true,
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
    return this.historyRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'recipe'],
      select: {
        id: true,
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

  async update(id: string, updateDto: UpdateHistoryDto) {
    // Không có trường nào để update, chỉ trả về bản ghi hiện tại
    return this.findOne(id);
  }

  async remove(id: string) {
    const history = await this.historyRepository.findOne({ where: { id } });
    if (!history) return null;
    await this.historyRepository.remove(history);
    return { deleted: true };
  }
} 
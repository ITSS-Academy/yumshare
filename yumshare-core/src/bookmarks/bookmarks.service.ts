import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity/bookmark.entity';
import { CreateBookmarkDto } from './dto/create-bookmark.dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto/update-bookmark.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createBookmarkDto: CreateBookmarkDto) {
    const user = await this.userRepository.findOne({ where: { id: createBookmarkDto.user_id } });
    const recipe = await this.recipeRepository.findOne({ where: { id: createBookmarkDto.recipe_id } });
    if (!user || !recipe) throw new Error('User or Recipe not found');
    const bookmark = this.bookmarkRepository.create({ user, recipe });
    return this.bookmarkRepository.save(bookmark);
  }

  findAll() {
    return this.bookmarkRepository.find({ relations: ['user', 'recipe'] });
  }

  findOne(id: string) {
    return this.bookmarkRepository.findOne({ where: { id }, relations: ['user', 'recipe'] });
  }

  async update(id: string, updateBookmarkDto: UpdateBookmarkDto) {
    // Usually nothing to update for a bookmark, but method is here for completeness
    return this.findOne(id);
  }

  async remove(id: string) {
    const bookmark = await this.bookmarkRepository.findOne({ where: { id } });
    if (!bookmark) return null;
    await this.bookmarkRepository.remove(bookmark);
    return { deleted: true };
  }
}

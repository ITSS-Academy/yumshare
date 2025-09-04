import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListResult } from '../common/types/list-result.type';
import { QueryOptsDto } from '../common/dto/query-opts.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Check if category name already exists
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name }
    });

    if (existingCategory) {
      throw new BadRequestException('Category name already exists');
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(queryOpts: QueryOptsDto = {}): Promise<ListResult<Category>> {
    const { page = 1, size = 20, orderBy = 'sort_order', order = 'ASC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [categories, total] = await this.categoryRepository.findAndCount({
      where: { is_active: true },
      order: { [orderBy]: order, name: 'ASC' },
      skip,
      take: size,
    });

    return new ListResult(categories, total, page, size);
  }

  findAllWithRecipes() {
    return this.categoryRepository.find({
      where: { is_active: true },
      relations: ['recipes'],
      order: { sort_order: 'ASC', name: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({ 
      where: { id },
      relations: ['recipes']
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if new name conflicts with existing category
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name }
      });

      if (existingCategory) {
        throw new BadRequestException('Category name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({ 
      where: { id },
      relations: ['recipes']
    });
    
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has recipes
    if (category.recipes && category.recipes.length > 0) {
      throw new BadRequestException('Cannot delete category with existing recipes');
    }

    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async getCategoryStats() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.recipes', 'recipe')
      .select([
        'category.id',
        'category.name',
        'COUNT(recipe.id) as recipeCount'
      ])
      .where('category.is_active = :isActive', { isActive: true })
      .groupBy('category.id')
      .orderBy('recipeCount', 'DESC')
      .getRawMany();

    return categories;
  }

  async searchCategories(queryOpts: QueryOptsDto): Promise<ListResult<Category>> {
    const { page = 1, size = 20, query = '', orderBy = 'sort_order', order = 'ASC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [categories, total] = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name ILIKE :query', { query: `%${query}%` })
      .orWhere('category.description ILIKE :query', { query: `%${query}%` })
      .andWhere('category.is_active = :isActive', { isActive: true })
      .orderBy(`category.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .addOrderBy('category.name', 'ASC')
      .skip(skip)
      .take(size)
      .getManyAndCount();

    return new ListResult(categories, total, page, size);
  }
}

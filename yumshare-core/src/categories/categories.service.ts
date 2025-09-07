import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListResult } from '../common/types/list-result.type';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { OptimizedQueryService } from '../common/services/optimized-query.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly optimizedQueryService: OptimizedQueryService,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

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
    const { page = 1, size = 20 } = queryOpts;
    
    // Use optimized query service for better performance
    const result = await this.optimizedQueryService.executeOptimizedQuery(
      this.categoryRepository,
      queryOpts,
      {
        relations: [],
        maxRelations: 0,
        selectFields: ['id', 'name', 'description', 'sort_order', 'is_active'],
        enableCache: false
      }
    );

    const listResult = new ListResult(result.data, result.total, result.page, result.size);
    
    this.logger.log(`Categories fetched: ${result.data.length} results, total: ${result.total}, page: ${result.page}`);
    
    return listResult;
  }

  findAllWithRecipes() {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: { sort_order: 'ASC', name: 'ASC' }
    });
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({ 
      where: { id }
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

  async getCategoryRecipeCount(categoryId: string): Promise<number> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.recipes', 'recipe')
      .where('category.id = :categoryId', { categoryId })
      .getCount();
  }

  async getCategoryRecipes(categoryId: string, queryOpts: QueryOptsDto = {}) {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    const skip = (page - 1) * size;
    
    const [recipes, total] = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.recipes', 'recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('category.id = :categoryId', { categoryId })
      .orderBy(`recipe.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(size)
      .getManyAndCount();

    return {
      category: recipes[0] || null,
      recipes: recipes[0]?.recipes || [],
      total,
      page,
      size
    };
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

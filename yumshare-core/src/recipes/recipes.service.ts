import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe } from './entities/recipe.entity/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto/update-recipe.dto';
import { User } from '../auth/entities/user.entity';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { RecipeStep } from '../recipe-steps/entities/recipe-step.entity';
import { ListResult } from '../common/types/list-result.type';
import { QueryOptsDto } from '../common/dto/query-opts.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RecipeStep)
    private readonly recipeStepRepository: Repository<RecipeStep>,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const user = await this.userRepository.findOne({ where: { id: createRecipeDto.user_id } });
    if (!user) throw new Error('User not found');
    
    // Sử dụng transaction để đảm bảo tính nhất quán
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const recipe = this.recipeRepository.create({
        ...createRecipeDto,
        user,
      });
      delete (recipe as any).user_id;
      delete (recipe as any).steps;
      
      const savedRecipe = await queryRunner.manager.save(Recipe, recipe);

      // Create recipe steps if provided
      if (createRecipeDto.steps && createRecipeDto.steps.length > 0) {
        for (const stepData of createRecipeDto.steps) {
          const step = this.recipeStepRepository.create({
            ...stepData,
            recipe_id: savedRecipe.id
          });
          await queryRunner.manager.save(RecipeStep, step);
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedRecipe.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryOpts: QueryOptsDto = {}): Promise<ListResult<Recipe>> {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [recipes, total] = await this.recipeRepository.findAndCount({
      relations: ['user', 'category', 'steps'],
      order: { [orderBy]: order },
      skip,
      take: size,
    });

    return new ListResult(recipes, total, page, size);
  }

  findOne(id: string) {
    return this.recipeRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'category', 'steps'],
      order: { steps: { step_number: 'ASC' } }
    });
  }

  async findByCategory(categoryId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Recipe>> {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { category_id: categoryId },
      relations: ['user', 'category', 'steps'],
      order: { [orderBy]: order },
      skip,
      take: size,
    });

    return new ListResult(recipes, total, page, size);
  }

  async searchRecipes(queryOpts: QueryOptsDto): Promise<ListResult<Recipe>> {
    const { 
      page = 1, 
      size = 10, 
      orderBy = 'created_at', 
      order = 'DESC',
      query = '',
      category,
      author,
      difficulty,
      rating
    } = queryOpts;

    const skip = (page - 1) * size;
    
    let qb = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      .leftJoinAndSelect('recipe.steps', 'steps');

    // Search query
    if (query) {
      qb = qb.where(
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

    // Author filter
    if (author) {
      if (/^[0-9a-fA-F-]{36}$/.test(author)) {
        qb = qb.andWhere('user.id = :userId', { userId: author });
      } else {
        qb = qb.andWhere('user.username ILIKE :username', { username: `%${author}%` });
      }
    }

    // Difficulty filter
    if (difficulty) {
      qb = qb.andWhere('recipe.difficulty = :difficulty', { difficulty });
    }

    // Rating filter (if ratings table exists)
    if (rating) {
      qb = qb.andWhere('EXISTS (SELECT 1 FROM ratings r WHERE r.recipe_id = recipe.id AND r.rating >= :rating)', { rating });
    }

    const [recipes, total] = await qb
      .orderBy(`recipe.${orderBy}`, order.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(size)
      .getManyAndCount();

    return new ListResult(recipes, total, page, size);
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.findOne(id);
    if (!recipe) return null;

    // Sử dụng transaction để đảm bảo tính nhất quán
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Handle steps separately
      const { steps, ...recipeData } = updateRecipeDto;
      
      Object.assign(recipe, recipeData);
      await queryRunner.manager.save(Recipe, recipe);

      // Update steps if provided
      if (steps) {
        // Delete existing steps
        await queryRunner.manager.delete(RecipeStep, { recipe_id: id });
        
        // Create new steps with auto-reordered step_number
        for (let i = 0; i < steps.length; i++) {
          const stepData = steps[i];
          const step = this.recipeStepRepository.create({
            ...stepData,
            step_number: i + 1, // Auto-reorder: 1, 2, 3, 4, 5...
            recipe_id: id
          });
          await queryRunner.manager.save(RecipeStep, step);
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string) {
    const recipe = await this.findOne(id);
    if (!recipe) return null;

    // Sử dụng transaction để đảm bảo tính nhất quán
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Remove recipe steps first
      await queryRunner.manager.delete(RecipeStep, { recipe_id: id });

      // Remove recipe
      await queryRunner.manager.remove(Recipe, recipe);
      
      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // src/recipes/recipes.service.ts
  async uploadImage(recipeId: string, file: Express.Multer.File) {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const imageUrl = await this.supabaseStorageService.uploadImage(file, `recipes/${recipeId}`);
    recipe.image_url = imageUrl;
    return this.recipeRepository.save(recipe);
  }

  async uploadVideo(recipeId: string, file: Express.Multer.File) {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Upload video to Supabase Storage
    const videoUrl = await this.supabaseStorageService.uploadVideo(file, `recipes/${recipeId}`);

    // Update video URL
    recipe.video_url = videoUrl;
    return this.recipeRepository.save(recipe);
  }

  async removeVideo(recipeId: string) {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    if (recipe.video_url) {
      // Remove video from Supabase Storage
      await this.supabaseStorageService.deleteVideo(recipe.video_url);
      
      // Clear video URL from recipe
      recipe.video_url = null as any;
      return this.recipeRepository.save(recipe);
    }

    return recipe;
  }

  async getRecipeWithSteps(recipeId: string) {
    return this.recipeRepository.findOne({
      where: { id: recipeId },
      relations: ['user', 'steps'],
      order: { steps: { step_number: 'ASC' } }
    });
  }
}

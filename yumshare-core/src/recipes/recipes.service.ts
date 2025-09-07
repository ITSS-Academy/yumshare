import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
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
import { OptimizedQueryService } from '../common/services/optimized-query.service';
import { NotificationsService } from '../notifications/notifications.service';

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
    private readonly optimizedQueryService: OptimizedQueryService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly logger = new Logger(RecipesService.name);

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
      
      // Gửi thông báo cho followers sau khi tạo recipe thành công
      try {
        const recipeWithUser = await this.findOne(savedRecipe.id);
        if (recipeWithUser && recipeWithUser.user) {
          await this.notificationsService.notifyFollowersNewRecipe(
            createRecipeDto.user_id,
            {
              id: savedRecipe.id,
              title: savedRecipe.title,
              authorName: recipeWithUser.user.username || recipeWithUser.user.email || 'Unknown User'
            }
          );
          this.logger.log(`Notifications sent to followers for new recipe: ${savedRecipe.title}`);
        }
      } catch (notificationError) {
        // Log lỗi nhưng không làm fail việc tạo recipe
        this.logger.error('Failed to send notifications for new recipe:', notificationError);
      }
      
      return this.findOne(savedRecipe.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryOpts: QueryOptsDto = {}): Promise<ListResult<Recipe>> {
    const { page = 1, size = 10 } = queryOpts;
    
    // Use optimized query service for better performance
    const result = await this.optimizedQueryService.executeOptimizedQuery(
      this.recipeRepository,
      queryOpts,
      {
        relations: ['user', 'category'],
        maxRelations: 2,
        selectFields: ['id', 'title', 'description', 'image_url', 'created_at', 'difficulty', 'total_cooking_time'],
        enableCache: false
      }
    );

    const listResult = new ListResult(result.data, result.total, result.page, result.size);
    
    this.logger.log(`Recipes fetched: ${result.data.length} results, total: ${result.total}, page: ${result.page}`);
    
    return listResult;
  }

  findOne(id: string) {
    return this.recipeRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'category', 'steps'],
      order: { steps: { step_number: 'ASC' } }
    });
  }

  async checkEditPermission(recipeId: string, currentUserId: string) {
    const recipe = await this.findOne(recipeId);
    if (!recipe) {
      return { 
        canEdit: false, 
        message: 'Recipe not found' 
      };
    }

    // Kiểm tra quyền: chỉ user tạo ra recipe mới được edit
    if (recipe.user.id !== currentUserId) {
      return { 
        canEdit: false, 
        message: 'You do not have permission to edit this recipe' 
      };
    }

    return { 
      canEdit: true, 
      message: 'You have permission to edit this recipe',
      recipe: recipe
    };
  }

  async findByCategory(categoryId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Recipe>> {
    const { page = 1, size = 10, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [recipes, total] = await this.recipeRepository.findAndCount({
      where: { category_id: categoryId },
      relations: ['user', 'category'],
      order: { [orderBy]: order },
      skip,
      take: size,
    });

    return new ListResult(recipes, total, page, size);
  }

  async findByUserId(userId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Recipe>> {
    const { 
      page = 1, 
      size = 10, 
      orderBy = 'created_at', 
      order = 'DESC',
      category,
      difficulty,
      rating
    } = queryOpts;
    
    const skip = (page - 1) * size;
    
    let qb = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category')
      .where('user.id = :userId', { userId });

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
      .leftJoinAndSelect('recipe.category', 'category');

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

  async update(id: string, updateRecipeDto: UpdateRecipeDto, currentUserId: string) {
    const recipe = await this.findOne(id);
    if (!recipe) return null;

    // Kiểm tra quyền: chỉ user tạo ra recipe mới được update
    if (recipe.user.id !== currentUserId) {
      throw new Error('You do not have permission to update this recipe');
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Handle steps separately
      const { steps, ...recipeData } = updateRecipeDto;
      
      // Check if video_url is being changed and if old video exists on Supabase Storage
      if (recipeData.video_url !== undefined && recipeData.video_url !== recipe.video_url) {
        const oldVideoUrl = recipe.video_url;
        
        // If old video exists on Supabase Storage and new video is different (could be YouTube URL or new file)
        if (oldVideoUrl && this.isSupabaseStorageUrl(oldVideoUrl)) {
          try {
            // Delete old video from Supabase Storage
            await this.supabaseStorageService.deleteVideo(oldVideoUrl);
            console.log(`Deleted old video from Supabase Storage: ${oldVideoUrl}`);
          } catch (error) {
            console.error('Failed to delete old video from Supabase Storage:', error);
            // Continue with update even if deletion fails
          }
        }
      }

      // Check if image_url is being changed and if old image exists on Supabase Storage
      if (recipeData.image_url !== undefined && recipeData.image_url !== recipe.image_url) {
        const oldImageUrl = recipe.image_url;
        
        // If old image exists on Supabase Storage and new image is different
        if (oldImageUrl && this.isSupabaseStorageUrl(oldImageUrl)) {
          try {
            // Delete old image from Supabase Storage
            await this.supabaseStorageService.deleteImage(oldImageUrl);
            console.log(`Deleted old image from Supabase Storage: ${oldImageUrl}`);
          } catch (error) {
            console.error('Failed to delete old image from Supabase Storage:', error);
            // Continue with update even if deletion fails
          }
        }
      }
      
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

  async remove(id: string, currentUserId: string) {
    const recipe = await this.findOne(id);
    if (!recipe) return null;

    // Kiểm tra quyền: chỉ user tạo ra recipe mới được delete
    if (recipe.user.id !== currentUserId) {
      throw new Error('You do not have permission to delete this recipe');
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Remove recipe steps first
      await queryRunner.manager.delete(RecipeStep, { recipe_id: id });

      // Remove image and video from Supabase Storage before deleting recipe
      if (recipe.image_url && this.isSupabaseStorageUrl(recipe.image_url)) {
        try {
          await this.supabaseStorageService.deleteImage(recipe.image_url);
          console.log(`Deleted image from Supabase Storage: ${recipe.image_url}`);
        } catch (error) {
          console.error('Failed to delete image from Supabase Storage:', error);
        }
      }

      if (recipe.video_url && this.isSupabaseStorageUrl(recipe.video_url)) {
        try {
          await this.supabaseStorageService.deleteVideo(recipe.video_url);
          console.log(`Deleted video from Supabase Storage: ${recipe.video_url}`);
        } catch (error) {
          console.error('Failed to delete video from Supabase Storage:', error);
        }
      }

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

    // Check if there's an existing image on Supabase Storage and delete it first
    if (recipe.image_url && this.isSupabaseStorageUrl(recipe.image_url)) {
      try {
        await this.supabaseStorageService.deleteImage(recipe.image_url);
        console.log(`Deleted existing image from Supabase Storage: ${recipe.image_url}`);
      } catch (error) {
        console.error('Failed to delete existing image from Supabase Storage:', error);
        // Continue with upload even if deletion fails
      }
    }

    const imageResult = await this.supabaseStorageService.uploadImage(file, `recipes/${recipeId}`);
    recipe.image_url = imageResult.mainUrl;
    // Note: thumbnail URL is available in imageResult.thumbnailUrl if needed
    return this.recipeRepository.save(recipe);
  }

  async uploadVideo(recipeId: string, file: Express.Multer.File) {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    // Check if there's an existing video on Supabase Storage and delete it first
    if (recipe.video_url && this.isSupabaseStorageUrl(recipe.video_url)) {
      try {
        await this.supabaseStorageService.deleteVideo(recipe.video_url);
        console.log(`Deleted existing video from Supabase Storage: ${recipe.video_url}`);
      } catch (error) {
        console.error('Failed to delete existing video from Supabase Storage:', error);
        // Continue with upload even if deletion fails
      }
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

  async removeImage(recipeId: string) {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    if (recipe.image_url) {
      // Remove image from Supabase Storage
      await this.supabaseStorageService.deleteImage(recipe.image_url);
      
      // Clear image URL from recipe
      recipe.image_url = null as any;
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

  async getRecipeSteps(recipeId: string) {
    return this.recipeStepRepository.find({
      where: { recipe_id: recipeId },
      order: { step_number: 'ASC' }
    });
  }

  async getMultipleRecipeSteps(recipeIds: string[]) {
    return this.recipeStepRepository.find({
      where: { recipe_id: { $in: recipeIds } as any },
      order: { recipe_id: 'ASC', step_number: 'ASC' }
    });
  }

  /**
   * Check if a URL is from Supabase Storage
   */
  private isSupabaseStorageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      // Check if the URL contains supabase.co domain and storage path
      return urlObj.hostname.includes('supabase.co') && urlObj.pathname.includes('/storage/');
    } catch {
      return false;
    }
  }
}

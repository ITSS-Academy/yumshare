import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto/update-comment.dto';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { ListResult } from '../common/types/list-result.type';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { TimezoneService } from '../common/services/timezone.service';
import { OptimizedQueryService } from '../common/services/optimized-query.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    private readonly timezoneService: TimezoneService,
    private readonly optimizedQueryService: OptimizedQueryService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly logger = new Logger(CommentsService.name);

  async create(createCommentDto: CreateCommentDto) {
    const user = await this.userRepository.findOne({ where: { id: createCommentDto.user_id } });
    const recipe = await this.recipeRepository.findOne({ 
      where: { id: createCommentDto.recipe_id },
      relations: ['user']
    });
    if (!user || !recipe) throw new Error('User or Recipe not found');
    
    // Create comment - timestamps will be handled automatically by TypeORM
    const comment = this.commentRepository.create({
      user,
      recipe,
      content: createCommentDto.content
    });
    
    const savedComment = await this.commentRepository.save(comment);
    
    // Create notification for recipe owner (if not commenting on own recipe)
    if (recipe.user.id !== createCommentDto.user_id) {
      try {
        await this.notificationsService.create({
          user_id: recipe.user.id,
          type: NotificationType.COMMENT,
          content: `${user.username || user.email} commented on your recipe "${recipe.title}"`,
          metadata: {
            recipe_id: recipe.id,
            comment_id: savedComment.id
          }
        });
      } catch (error) {
        this.logger.error('Error creating comment notification:', error);
        // Don't throw error to avoid breaking comment creation
      }
    }
    
    return savedComment;
  }

  async findAll(queryOpts: QueryOptsDto = {}): Promise<ListResult<Comment>> {
    const { page = 1, size = 20 } = queryOpts;
    
    // Use optimized query service with limited relations
    const result = await this.optimizedQueryService.executeOptimizedQuery(
      this.commentRepository,
      queryOpts,
      {
        relations: ['user', 'recipe'],
        maxRelations: 2,
        selectFields: ['id', 'content', 'created_at', 'updated_at'],
        enableCache: false
      }
    );

    // Transform timestamps to ensure proper timezone handling
    const transformedComments = result.data.map(comment => ({
      ...comment,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    })) as Comment[];

    const listResult = new ListResult(transformedComments, result.total, result.page, result.size);
    
    this.logger.log(`Comments fetched: ${result.data.length} results, total: ${result.total}, page: ${result.page}`);
    
    return listResult;
  }

  findOne(id: string) {
    return this.commentRepository.findOne({ 
      where: { id }, 
      relations: ['user', 'recipe'],
      select: {
        id: true,
        content: true,
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

  async findByRecipe(recipeId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Comment>> {
    const { page = 1, size = 20, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    // Use query builder with limited relations to reduce Cached Egress
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.recipe', 'recipe')
      .select([
        'comment.id',
        'comment.content',
        'comment.created_at',
        'comment.updated_at',
        'user.id',
        'user.username',
        'user.avatar_url',
        'recipe.id',
        'recipe.title',
        'recipe.image_url'
      ])
      .where('comment.recipe_id = :recipeId', { recipeId })
      .orderBy(`comment.${orderBy}`, order as 'ASC' | 'DESC')
      .skip(skip)
      .take(size);

    const [comments, total] = await queryBuilder.getManyAndCount();

    // Transform timestamps to ensure proper timezone handling
    const transformedComments = comments.map(comment => ({
      ...comment,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    })) as Comment[];

    return new ListResult(transformedComments, total, page, size);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    // Find comment with user relation
    const comment = await this.commentRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    
    if (!comment) return null;
    
    // Update comment - updated_at will be handled automatically by TypeORM
    Object.assign(comment, updateCommentDto);
    
    // Save the updated comment
    await this.commentRepository.save(comment);
    
    // Reload comment with user relation to ensure data consistency
    const reloadedComment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user']
    });
    
    return reloadedComment;
  }

  async remove(id: string) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) return null;
    await this.commentRepository.remove(comment);
    return { deleted: true };
  }

  async debugRecipe(recipeId: string) {
    const recipe = await this.recipeRepository.findOne({ 
      where: { id: recipeId },
      relations: ['user']
    });
    
    if (!recipe) {
      return { error: 'Recipe not found' };
    }
    
    return {
      recipeId: recipe.id,
      title: recipe.title,
      ownerId: recipe.user?.id,
      ownerUsername: recipe.user?.username,
      ownerEmail: recipe.user?.email,
      hasUser: !!recipe.user
    };
  }

  async testNotification(userId: string, recipeId: string) {
    const recipe = await this.recipeRepository.findOne({ 
      where: { id: recipeId },
      relations: ['user']
    });
    
    if (!recipe) {
      return { error: 'Recipe not found' };
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return { error: 'User not found' };
    }

    this.logger.log(`Testing notification: User ${userId} commenting on recipe ${recipeId} owned by ${recipe.user.id}`);

    if (recipe.user.id !== userId) {
      try {
        const notification = await this.notificationsService.create({
          user_id: recipe.user.id,
          type: NotificationType.COMMENT,
          content: `${user.username || user.email} commented on your recipe "${recipe.title}"`,
          metadata: {
            recipe_id: recipe.id,
            comment_id: 'test-comment-id'
          }
        });
        return { 
          success: true, 
          notificationId: notification.id,
          message: 'Notification created successfully'
        };
      } catch (error) {
        this.logger.error('Error creating test notification:', error);
        return { 
          success: false, 
          error: error.message 
        };
      }
    } else {
      return { 
        success: false, 
        message: 'User is commenting on their own recipe, no notification needed' 
      };
    }
  }
}

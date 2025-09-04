import { Injectable } from '@nestjs/common';
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
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const user = await this.userRepository.findOne({ where: { id: createCommentDto.user_id } });
    const recipe = await this.recipeRepository.findOne({ where: { id: createCommentDto.recipe_id } });
    if (!user || !recipe) throw new Error('User or Recipe not found');
    
    // Create comment with proper Vietnam timezone
    const vietnamTime = this.timezoneService.getCurrentVietnamTime();
    const comment = this.commentRepository.create({
      user,
      recipe,
      content: createCommentDto.content,
      created_at: vietnamTime,
      updated_at: vietnamTime
    });
    
    const savedComment = await this.commentRepository.save(comment);
    
    return savedComment;
  }

  async findAll(queryOpts: QueryOptsDto = {}): Promise<ListResult<Comment>> {
    const { page = 1, size = 20, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [comments, total] = await this.commentRepository.findAndCount({
      relations: ['user', 'recipe'],
      order: { [orderBy]: order },
      skip,
      take: size,
    });

    // Transform timestamps to ensure proper timezone handling
    const transformedComments = comments.map(comment => ({
      ...comment,
      created_at: this.timezoneService.toVietnamTime(comment.created_at),
      updated_at: this.timezoneService.toVietnamTime(comment.updated_at)
    })) as Comment[];

    return new ListResult(transformedComments, total, page, size);
  }

  findOne(id: string) {
    return this.commentRepository.findOne({ where: { id }, relations: ['user', 'recipe'] });
  }

  async findByRecipe(recipeId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Comment>> {
    const { page = 1, size = 20, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    // Use query builder with relations to get comments with user data
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.recipe', 'recipe')
      .where('comment.recipe_id = :recipeId', { recipeId })
      .orderBy(`comment.${orderBy}`, order as 'ASC' | 'DESC')
      .skip(skip)
      .take(size);

    const [comments, total] = await queryBuilder.getManyAndCount();

    // Transform timestamps to ensure proper timezone handling
    const transformedComments = comments.map(comment => ({
      ...comment,
      created_at: this.timezoneService.toVietnamTime(comment.created_at),
      updated_at: this.timezoneService.toVietnamTime(comment.updated_at)
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
    
    // Update with proper Vietnam timezone
    const vietnamTime = this.timezoneService.getCurrentVietnamTime();
    Object.assign(comment, {
      ...updateCommentDto,
      updated_at: vietnamTime
    });
    
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
}

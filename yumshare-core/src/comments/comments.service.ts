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

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const user = await this.userRepository.findOne({ where: { id: createCommentDto.user_id } });
    const recipe = await this.recipeRepository.findOne({ where: { id: createCommentDto.recipe_id } });
    if (!user || !recipe) throw new Error('User or Recipe not found');
    const comment = this.commentRepository.create({
      user,
      recipe,
      content: createCommentDto.content,
    });
    return this.commentRepository.save(comment);
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

    return new ListResult(comments, total, page, size);
  }

  findOne(id: string) {
    return this.commentRepository.findOne({ where: { id }, relations: ['user', 'recipe'] });
  }

  async findByRecipe(recipeId: string, queryOpts: QueryOptsDto = {}): Promise<ListResult<Comment>> {
    const { page = 1, size = 20, orderBy = 'created_at', order = 'DESC' } = queryOpts;
    
    const skip = (page - 1) * size;
    
    const [comments, total] = await this.commentRepository.findAndCount({ 
      where: { recipe: { id: recipeId } }, 
      relations: ['user'],
      order: { [orderBy]: order },
      skip,
      take: size,
    });

    return new ListResult(comments, total, page, size);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) return null;
    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(id: string) {
    const comment = await this.commentRepository.findOne({ where: { id } });
    if (!comment) return null;
    await this.commentRepository.remove(comment);
    return { deleted: true };
  }
}

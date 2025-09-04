import { Controller, Post, Get, Param, Delete, Body,  Put, Query, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto/update-comment.dto';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('comments')
@UseGuards(RateLimitGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @RateLimit(RateLimits.STRICT)
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(createCommentDto);
  }

  @Get()
  @RateLimit(RateLimits.STANDARD)
  findAll(@Query() queryOpts: QueryOptsDto) {
    return this.commentsService.findAll(queryOpts);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Get('recipe/:recipeId')
  findByRecipe(
    @Param('recipeId') recipeId: string,
    @Query() queryOpts: QueryOptsDto
  ) {
    return this.commentsService.findByRecipe(recipeId, queryOpts);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }
}

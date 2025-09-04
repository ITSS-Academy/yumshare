import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity/comment.entity';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { TimezoneService } from '../common/services/timezone.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Recipe])],
  providers: [CommentsService, TimezoneService],
  controllers: [CommentsController]
})
export class CommentsModule {}

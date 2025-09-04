import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating } from './entities/rating.entity/rating.entity';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, User, Recipe])],
  providers: [RatingsService],
  controllers: [RatingsController]
})
export class RatingsModule {}

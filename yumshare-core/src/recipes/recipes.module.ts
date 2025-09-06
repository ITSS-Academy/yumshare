import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity/recipe.entity';
import { User } from '../auth/entities/user.entity';
import { RecipeStep } from '../recipe-steps/entities/recipe-step.entity';
import { CommonModule } from '../common/common.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipe, User, RecipeStep]),
    CommonModule,
    forwardRef(() => NotificationsModule)
  ],
  providers: [RecipesService],
  controllers: [RecipesController]
})
export class RecipesModule {}

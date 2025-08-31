import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity/recipe.entity';
import { User } from '../auth/entities/user.entity';
import { RecipeStep } from '../recipe-steps/entities/recipe-step.entity';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, User, RecipeStep])],
  providers: [RecipesService, SupabaseStorageService],
  controllers: [RecipesController]
})
export class RecipesModule {}

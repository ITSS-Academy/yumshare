import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeStepsService } from './recipe-steps.service';
import { RecipeStepsController } from './recipe-steps.controller';
import { RecipeStep } from './entities/recipe-step.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([RecipeStep, Recipe])],
  providers: [RecipeStepsService, SupabaseStorageService],
  controllers: [RecipeStepsController],
  exports: [RecipeStepsService]
})
export class RecipeStepsModule {}

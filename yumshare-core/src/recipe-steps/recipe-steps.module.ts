import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeStepsService } from './recipe-steps.service';
import { RecipeStepsController } from './recipe-steps.controller';
import { RecipeStep } from './entities/recipe-step.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecipeStep, Recipe]),
    CommonModule
  ],
  providers: [RecipeStepsService],
  controllers: [RecipeStepsController],
  exports: [RecipeStepsService]
})
export class RecipeStepsModule {}

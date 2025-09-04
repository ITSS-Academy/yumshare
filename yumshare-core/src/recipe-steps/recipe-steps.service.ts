import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeStep } from './entities/recipe-step.entity';
import { CreateRecipeStepDto } from './dto/create-recipe-step.dto';
import { UpdateRecipeStepDto } from './dto/update-recipe-step.dto';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Injectable()
export class RecipeStepsService {
  constructor(
    @InjectRepository(RecipeStep)
    private readonly recipeStepRepository: Repository<RecipeStep>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async createStep(recipeId: string, createStepDto: CreateRecipeStepDto) {
    // Check if recipe exists
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new BadRequestException('Recipe not found');
    }

    // Check if step number already exists for this recipe
    const existingStep = await this.recipeStepRepository.findOne({
      where: { recipe_id: recipeId, step_number: createStepDto.step_number }
    });

    if (existingStep) {
      throw new BadRequestException(`Step number ${createStepDto.step_number} already exists for this recipe`);
    }

    // Create step
    const step = this.recipeStepRepository.create({
      ...createStepDto,
      recipe_id: recipeId
    });

    return this.recipeStepRepository.save(step);
  }

  async updateStep(stepId: string, updateStepDto: UpdateRecipeStepDto) {
    const step = await this.recipeStepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new BadRequestException('Recipe step not found');
    }

    // If updating step number, check for conflicts
    if (updateStepDto.step_number && updateStepDto.step_number !== step.step_number) {
      const existingStep = await this.recipeStepRepository.findOne({
        where: { 
          recipe_id: step.recipe_id, 
          step_number: updateStepDto.step_number 
        }
      });

      if (existingStep) {
        throw new BadRequestException(`Step number ${updateStepDto.step_number} already exists for this recipe`);
      }
    }

    Object.assign(step, updateStepDto);
    return this.recipeStepRepository.save(step);
  }

  async deleteStep(stepId: string) {
    const step = await this.recipeStepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new BadRequestException('Recipe step not found');
    }

    await this.recipeStepRepository.remove(step);
    return { message: 'Recipe step deleted successfully' };
  }

  async getRecipeSteps(recipeId: string) {
    return this.recipeStepRepository.find({
      where: { recipe_id: recipeId },
      order: { step_number: 'ASC' }
    });
  }

  async getStepById(stepId: string) {
    return this.recipeStepRepository.findOne({ 
      where: { id: stepId },
      relations: ['recipe']
    });
  }

  async reorderSteps(recipeId: string, stepIds: string[]) {
    const steps = await this.recipeStepRepository.find({
      where: { recipe_id: recipeId }
    });

    if (steps.length !== stepIds.length) {
      throw new BadRequestException('Invalid step IDs provided');
    }

    // Update step numbers based on new order
    for (let i = 0; i < stepIds.length; i++) {
      const step = steps.find(s => s.id === stepIds[i]);
      if (step) {
        step.step_number = i + 1;
        await this.recipeStepRepository.save(step);
      }
    }

    return this.getRecipeSteps(recipeId);
  }

  async uploadStepImage(stepId: string, imageUrl: string) {
    const step = await this.recipeStepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new BadRequestException('Recipe step not found');
    }

    step.image_url = imageUrl;
    return this.recipeStepRepository.save(step);
  }

  async uploadStepVideo(stepId: string, videoUrl: string) {
    const step = await this.recipeStepRepository.findOne({ where: { id: stepId } });
    if (!step) {
      throw new BadRequestException('Recipe step not found');
    }

    step.video_url = videoUrl;
    return this.recipeStepRepository.save(step);
  }
}

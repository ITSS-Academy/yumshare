import { Controller, Post, Get, Put, Delete, Param, Body, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecipeStepsService } from './recipe-steps.service';
import { CreateRecipeStepDto } from './dto/create-recipe-step.dto';
import { UpdateRecipeStepDto } from './dto/update-recipe-step.dto';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';

@Controller('recipe-steps')
export class RecipeStepsController {
  constructor(
    private readonly recipeStepsService: RecipeStepsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Post(':recipeId')
  createStep(
    @Param('recipeId') recipeId: string,
    @Body() createStepDto: CreateRecipeStepDto
  ) {
    return this.recipeStepsService.createStep(recipeId, createStepDto);
  }

  @Get('recipe/:recipeId')
  getRecipeSteps(@Param('recipeId') recipeId: string) {
    return this.recipeStepsService.getRecipeSteps(recipeId);
  }

  @Get(':stepId')
  getStepById(@Param('stepId') stepId: string) {
    return this.recipeStepsService.getStepById(stepId);
  }

  @Put(':stepId')
  updateStep(
    @Param('stepId') stepId: string,
    @Body() updateStepDto: UpdateRecipeStepDto
  ) {
    return this.recipeStepsService.updateStep(stepId, updateStepDto);
  }

  @Delete(':stepId')
  deleteStep(@Param('stepId') stepId: string) {
    return this.recipeStepsService.deleteStep(stepId);
  }

  @Post(':recipeId/reorder')
  reorderSteps(
    @Param('recipeId') recipeId: string,
    @Body() body: { stepIds: string[] }
  ) {
    return this.recipeStepsService.reorderSteps(recipeId, body.stepIds);
  }

  @Post(':stepId/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadStepImage(
    @Param('stepId') stepId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Upload image to Supabase Storage
    const imageUrl = await this.supabaseStorageService.uploadImage(file, `recipe-steps/${stepId}`);
    
    // Update step with image URL
    return this.recipeStepsService.uploadStepImage(stepId, imageUrl);
  }

  @Post(':stepId/video')
  @UseInterceptors(FileInterceptor('video'))
  async uploadStepVideo(
    @Param('stepId') stepId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB
          new FileTypeValidator({ fileType: 'video/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Upload video to Supabase Storage
    const videoUrl = await this.supabaseStorageService.uploadVideo(file, `recipe-steps/${stepId}`);
    
    // Update step with video URL
    return this.recipeStepsService.uploadStepVideo(stepId, videoUrl);
  }
}

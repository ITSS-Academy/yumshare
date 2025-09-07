import { Controller, Post, Get, Param, Delete, Body,  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query, UploadedFiles, Put, Req, UseGuards } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto/update-recipe.dto';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('recipes')
@UseGuards(RateLimitGuard)
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @RateLimit(RateLimits.STRICT)
  async create(@Body() createRecipeDto: CreateRecipeDto) {
    const created = await this.recipesService.create(createRecipeDto);
    return this.recipesService.findOne(created!.id);
  }

  @Post('with-files')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async createWithFiles(
    @Body() createRecipeDto: CreateRecipeDto,
    @UploadedFiles() files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
  ) {
    
    const created = await this.recipesService.create(createRecipeDto);

    if (files?.image?.[0]) {
      await this.recipesService.uploadImage(created!.id, files.image[0]);
    }
    if (files?.video?.[0]) {
      await this.recipesService.uploadVideo(created!.id, files.video[0]);
    }

    return this.recipesService.findOne(created!.id);
  }

  @Get()
  @RateLimit(RateLimits.STANDARD)
  findAll(@Query() queryOpts: QueryOptsDto) {
    return this.recipesService.findAll(queryOpts);
  }

  @Get('search')
  searchRecipes(@Query() queryOpts: QueryOptsDto) {
    return this.recipesService.searchRecipes(queryOpts);
  }

  @Get('category/:categoryId')
  findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() queryOpts: QueryOptsDto
  ) {
    return this.recipesService.findByCategory(categoryId, queryOpts);
  }

  @Get('user/:userId')
  @RateLimit(RateLimits.STANDARD)
  findByUserId(
    @Param('userId') userId: string,
    @Query() queryOpts: QueryOptsDto
  ) {
    return this.recipesService.findByUserId(userId, queryOpts);
  }

  @Get(':id/check-edit-permission')
  async checkEditPermission(@Param('id') id: string, @Req() req: any) {
    // Kiểm tra quyền: chỉ user tạo ra recipe mới được edit
    return this.recipesService.checkEditPermission(id, req.user.uid);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto, @Req() req: any) {
    return this.recipesService.update(id, updateRecipeDto, req.user.uid);
  }

  @Put(':id/with-files')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async updateWithFiles(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Req() req: any,
    @UploadedFiles() files?: { image?: Express.Multer.File[]; video?: Express.Multer.File[] }
  ) {
    // Update basic recipe data first
    await this.recipesService.update(id, updateRecipeDto, req.user.uid);

    // Update image if provided
    if (files?.image?.[0]) {
      await this.recipesService.uploadImage(id, files.image[0]);
    }

    // Update video if provided
    if (files?.video?.[0]) {
      await this.recipesService.uploadVideo(id, files.video[0]);
    }

    // Return updated recipe
    return this.recipesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.recipesService.remove(id, req.user.uid);
  }

  @Post(':id/video')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @Param('id') id: string,
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
    return this.recipesService.uploadVideo(id, file);
  }

  @Delete(':id/video')
  async removeVideo(@Param('id') id: string) {
    return this.recipesService.removeVideo(id);
  }



  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('id') id: string,
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
    return this.recipesService.uploadImage(id, file);
  }

  @Get(':id/steps')
  getRecipeSteps(@Param('id') id: string) {
    return this.recipesService.getRecipeSteps(id);
  }

  @Get('steps')
  getMultipleRecipeSteps(@Query('recipeIds') recipeIds: string) {
    const ids = recipeIds.split(',').filter(id => id.trim());
    return this.recipesService.getMultipleRecipeSteps(ids);
  }
}

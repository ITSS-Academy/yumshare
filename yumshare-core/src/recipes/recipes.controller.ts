import { Controller, Post, Get, Param, Delete, Body,  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Query, UploadedFiles, Put } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto/update-recipe.dto';
import { QueryOptsDto } from '../common/dto/query-opts.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(id);
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
}

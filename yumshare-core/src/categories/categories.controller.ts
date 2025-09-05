import { Controller, Post, Get, Put, Delete, Param, Body, Query, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';
import { QueryOptsDto } from '../common/dto/query-opts.dto';
import { RateLimit, RateLimits } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('categories')
@UseGuards(RateLimitGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Post()
  @RateLimit(RateLimits.STRICT)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @RateLimit(RateLimits.STANDARD)
  findAll(@Query() queryOpts: QueryOptsDto, @Query('withRecipes') withRecipes?: string) {
    if (withRecipes === 'true') {
      return this.categoriesService.findAllWithRecipes();
    }
    return this.categoriesService.findAll(queryOpts);
  }

  @Get('stats')
  getCategoryStats() {
    return this.categoriesService.getCategoryStats();
  }

  @Get('search')
  searchCategories(@Query() queryOpts: QueryOptsDto) {
    return this.categoriesService.searchCategories(queryOpts);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadCategoryImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'image/*' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // Upload image to Supabase Storage
    const imageUrl = await this.supabaseStorageService.uploadImage(file, `categories/${id}`);
    
    // Update category with image URL
    return this.categoriesService.update(id, { image_url: imageUrl.mainUrl });
  }
}

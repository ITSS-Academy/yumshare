import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { SupabaseStorageService } from '../common/services/supabase-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategoriesService, SupabaseStorageService],
  controllers: [CategoriesController],
  exports: [CategoriesService]
})
export class CategoriesModule {}

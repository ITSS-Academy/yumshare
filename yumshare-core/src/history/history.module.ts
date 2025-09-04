import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { History } from './entities/history.entity';
import { User } from '../auth/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity/recipe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([History, User, Recipe])],
  providers: [HistoryService],
  controllers: [HistoryController]
})
export class HistoryModule {} 
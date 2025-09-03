import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';


import { NotificationsModule } from './notifications/notifications.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { HistoryModule } from './history/history.module';
import { RatingsModule } from './ratings/ratings.module';
import { CommentsModule } from './comments/comments.module';
import { RecipesModule } from './recipes/recipes.module';
import { RecipeStepsModule } from './recipe-steps/recipe-steps.module';
import { CategoriesModule } from './categories/categories.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ChatsModule } from './chats/chats.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || '',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || '',
      autoLoadEntities: true,
      synchronize: false, // Disable auto-sync to prevent schema conflicts
      // Add timezone configuration
      extra: {
        timezone: 'Asia/Ho_Chi_Minh',
      },
    }),
    
    CommonModule,
    NotificationsModule,
    BookmarksModule,
    HistoryModule,
    RatingsModule,
    CommentsModule,
    RecipesModule,
    RecipeStepsModule,
    CategoriesModule,
    LikesModule,
    FollowsModule,
    FavoritesModule,
    ChatsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

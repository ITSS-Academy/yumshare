import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
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
import { MiddlewareAuthMiddleware } from './auth/auth.middleware';
import { CompressionMiddleware } from './common/middleware/compression.middleware';

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
      // Add timezone configuration for Vietnam
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply compression middleware globally
    consumer
      .apply(CompressionMiddleware)
      .forRoutes('*');

    // Apply auth middleware for protected routes
    consumer
      .apply(MiddlewareAuthMiddleware)
      .forRoutes(
        // { path: 'recipes', method: RequestMethod.POST },
        // { path: 'recipes/:id', method: RequestMethod.GET },  // Không cần auth middleware
        { path: 'recipes/:id/check-edit-permission', method: RequestMethod.GET },  // Cần auth middleware
        { path: 'recipes/:id', method: RequestMethod.PUT },
        { path: 'recipes/:id', method: RequestMethod.DELETE },
        { path: 'recipes/:id/with-files', method: RequestMethod.PUT },
        // { path: 'recipes/:id/image', method: RequestMethod.POST },
        // { path: 'recipes/:id/video', method: RequestMethod.POST }
      );
  }
}

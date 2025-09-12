import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';

async function bootstrap() {
  // Set global timezone to Vietnam
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  
  const app = await NestFactory.create(AppModule);
  const serviceAccount = require('../src/config/private-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  // Lấy ConfigService để đọc biến môi trường
  const configService = app.get(ConfigService);
  
  // Lấy PORT từ environment, mặc định là 3000
  const port = configService.get<number>('PORT') || 3000;
  
  // Enable CORS
  app.enableCors()

  // Global ValidationPipe với transform và whitelist
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📊 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`);
}
bootstrap();
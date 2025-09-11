import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';

async function bootstrap() {
  // Set global timezone to Vietnam
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  
  const app = await NestFactory.create(AppModule);
  
  // Initialize Firebase Admin
  try {
    let serviceAccount;
    
    // Check if we're in production (Railway) with environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: "googleapis.com"
      };
    } else {
      // Development: use local JSON file
      serviceAccount = require('../src/config/private-key.json');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    // Continue without Firebase for now
  }
  // Lấy ConfigService để đọc biến môi trường
  const configService = app.get(ConfigService);
  
  // Lấy PORT từ environment, mặc định là 3000
  const port = configService.get<number>('PORT') || 3000;
  
  // Enable CORS with specific origin for production
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:4200', 'https://yumshare.vn', 'https://www.yumshare.vn'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

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

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config';
// import { ValidationPipe } from '@nestjs/common';
// import * as admin from 'firebase-admin';

// async function bootstrap() {
//   // Set global timezone to Vietnam
//   process.env.TZ = 'Asia/Ho_Chi_Minh';
  
//   const app = await NestFactory.create(AppModule);
//   const serviceAccount = require('../src/config/private-key.json');
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
//   // Lấy ConfigService để đọc biến môi trường
//   const configService = app.get(ConfigService);
  
//   // Lấy PORT từ environment, mặc định là 3000
//   const port = configService.get<number>('PORT') || 3000;
  
//   // Enable CORS
//   app.enableCors()

//   // Global ValidationPipe với transform và whitelist
//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transformOptions: {
//         enableImplicitConversion: true,
//       },
//     }),
//   );

//   await app.listen(port);
//   console.log(`🚀 Application is running on: http://localhost:${port}`);
//   console.log(`📊 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`);
// }
// bootstrap();
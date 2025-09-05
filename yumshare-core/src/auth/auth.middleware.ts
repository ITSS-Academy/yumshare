import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class MiddlewareAuthMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {

    let token = req.headers.authorization;

    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      throw new HttpException('Authorization token is required', HttpStatus.UNAUTHORIZED);
    }

    try {
      let decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // Attach the user info to the request object
      console.log('User authenticated:', req.user.uid);
      next(); // Call the next middleware or route handler
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }
  }
}
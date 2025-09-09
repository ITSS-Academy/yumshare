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

    if (!token) {
      throw new HttpException('Authorization token is required', HttpStatus.UNAUTHORIZED);
    }

    // Handle Bearer token format
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    try {
      let decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // Attach the user info to the request object
      next(); // Call the next middleware or route handler
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      throw new HttpException('Invalid or expired token', HttpStatus.UNAUTHORIZED);
    }
  }
}
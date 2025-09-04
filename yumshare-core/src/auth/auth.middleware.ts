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

    console.log(token);
    try{
      let decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; // Attach the user info to the request object
      console.log('User authenticated:', req.user);
      next(); // Call the next middleware or route handler
    }catch (error){
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }
}
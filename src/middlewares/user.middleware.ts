import {
  Injectable,
  NestMiddleware,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { extractTokenFromHeader } from 'src/utils/helpers';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  logger = new Logger();
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async use(request: any, res: any, next: () => void) {
    const token = extractTokenFromHeader(request);
    if (!token) {
      next();
      return;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SECRET_KEY,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['jwt_payload'] = payload;
      request['user'] = await this.usersService.findByUsername(
        payload.username,
      );
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
      } else if (e.name === 'JsonWebTokenError') {
        throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
      } else {
        throw new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
    next();
  }
}

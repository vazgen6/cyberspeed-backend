import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { compareHash } from '../utils/hash';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {}

  async signPayload(username: string) {
    return sign({ username }, process.env.SECRET_KEY, { expiresIn: '7d' });
  }

  async validateUser(username: string) {
    return await this.userService.findByUsername(username);
  }

  async checkPassword(username: string, password: string): Promise<boolean> {
    const userFromDb = await this.userService.findByUsername(username);
    if (!userFromDb) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return await compareHash(password, userFromDb.password);
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginDTO } from '../auth/dto/login.dto';
import { IUser } from '../interfaces/IUser';
import { User } from '../models/user.schema';
import { UserDto } from './dto/user.dto';
import { hashIt, compareHash } from '../utils/hash';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<IUser>) {}

  public async createUser(user: UserDto) {
    const { username, password } = user;

    const dbUser = await this.userModel.findOne({
      username: username.toLowerCase(),
    });

    if (dbUser) {
      throw new HttpException('username already taken', HttpStatus.BAD_REQUEST);
    }

    const { _id } = await this.userModel.create({
      username: username.toLowerCase(),
      password: await hashIt(password),
    });

    const newUser = await this.findById(_id);
    return newUser;
  }

  async findByLogin(userDto: LoginDTO) {
    const { username, password } = userDto;
    const user = await this.userModel.findOne({
      username: username.toLowerCase(),
    });
    if (!user) {
      throw new HttpException('user doesnt exists', HttpStatus.BAD_REQUEST);
    }
    if (await compareHash(password, user.password)) {
      return user;
    } else {
      throw new HttpException('invalid credential', HttpStatus.BAD_REQUEST);
    }
  }

  async findByUsername(username: string) {
    const user = await this.userModel.findOne({
      username: username.toLowerCase(),
    });
    return user;
  }

  async findById(_id: string) {
    const user = await this.userModel.findById({ _id });
    if (!user) {
      throw new HttpException(`user doesn't exists`, HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  public async delete(_id: string) {
    const userFromDb = await this.userModel.findOne({ _id });
    if (!userFromDb) {
      throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    }
    // TODO: add check for user
    // TODO: remove user from chat room
    return await this.userModel.deleteOne({ _id });
  }
}

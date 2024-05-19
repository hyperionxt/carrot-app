import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';

import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwt: JwtService,
  ) {}

  async signupUser(user: CreateUserDto): Promise<User> {
    return this.usersService.createUser(user);
  }

  async signinUser(user: LoginUserDto): Promise<{ token: string }> {
    try {
      const userFound = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (!userFound) {
        throw new HttpException(
          'Invalid combination of email and password or this account does not exist',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const match = await compare(user.password, userFound.password);

      if (!match) {
        throw new HttpException(
          'Invalid combination of email and password or this account does not exist',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = {
        id: userFound.id,
        name: userFound.name,
        lastname: userFound.lastname,
        email: userFound.email,
      };

      const token = this.jwt.sign(payload);

      return { token };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'BAD REQUEST',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}

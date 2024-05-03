import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { PaginationQueryDto } from 'src/pagination/pagination-query.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private userService: UsersService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  create(user: CreateUserDto): Promise<User> {
    return this.userService.createUser(user);
  }

  findAll(pagination: PaginationQueryDto): Promise<User[]> {
    return this.userService.findAll(pagination);
  }

  findOne(id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  async update(id: number, user: AdminUpdateUserDto): Promise<User> {
    try {
      const userFound = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!userFound)
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      if (user.email) {
        const emailFound = await this.userRepository.findOne({
          where: { email: user.email },
        });
        if (emailFound) {
          throw new HttpException('Email already used', HttpStatus.CONFLICT);
        }
        userFound.email = user.email;
      }

      if (user.newPassword) {
        if (!user.oldPassword || user.oldPassword.length === 0) {
          throw new HttpException(
            'The latest password is required',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          const match = await compare(user.oldPassword, userFound.password);
          if (!match)
            throw new HttpException(
              'The latest password is not correct',
              HttpStatus.CONFLICT,
            );
          userFound.password = await hash(user.newPassword, 10);
        }
      }

      const updateUser = Object.assign(userFound, user);
      return this.userRepository.save(updateUser);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  remove(id: number): Promise<HttpException> {
    return this.userService.remove(id);
  }
}

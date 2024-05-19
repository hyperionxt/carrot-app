import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../pagination/pagination-query.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecipesService } from '../recipes/recipes.service';
import { Profile } from '../types/profile.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private recipeService: RecipesService,
  ) {}
  async createUser(user: CreateUserDto): Promise<User> {
    try {
      const userFound = await this.userRepository.findOne({
        where: { email: user.email },
      });

      if (userFound) {
        throw new HttpException('Email already used', HttpStatus.CONFLICT);
      }

      if (!user.password) {
        throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
      }
      if (!user.email) {
        throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
      }
      if (!user.name) {
        throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
      }

      const passwordHash = await hash(user.password, 10);
      user.password = passwordHash;
      user.role = Role.REGULAR;
      const newUser = this.userRepository.create(user);
      return this.userRepository.save(newUser);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findAll({ limit, offset }: PaginationQueryDto): Promise<User[]> {
    try {
      const allUsers = await this.userRepository.find({
        skip: offset,
        take: limit,
      });
      if (allUsers.length === 0)
        throw new HttpException(
          'There are no users registered yet',
          HttpStatus.NO_CONTENT,
        );
      return allUsers;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Service Unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const userFound = await this.userRepository.findOne({
        where: { id: id },
        relations: ['favorites'],
      });
      if (!userFound)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      return userFound;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Service Unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
    }
  }

  async update(id: number, user: UpdateUserDto): Promise<User> {
    try {
      const userFound = await this.userRepository.findOne({
        where: { id: id },
      });

      if (!userFound)
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);

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
      await this.userRepository.save(updateUser);
      return updateUser;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async removeByUser(id: number): Promise<HttpException> {
    try {
      const userFound = await this.userRepository.delete({ id });
      if (userFound.affected === 0)
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      return new HttpException('User deleted successfully', HttpStatus.OK);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async removeByAdmin(id: number): Promise<HttpException> {
    try {
      const userFound = await this.userRepository.delete({ id });
      if (userFound.affected === 0)
        throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
      return new HttpException('User deleted successfully', HttpStatus.OK);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getProfile(id: number): Promise<Profile> {
    try {
      const userFound = await this.userRepository.findOne({
        where: { id: id },
        relations: ['favorites'],
      });
      if (!userFound)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      const profile = {
        name: userFound.name,
        lastname: userFound.lastname,
        favorites: userFound.favorites,
        email: userFound.email,
        createdAt: userFound.createdAt,
      };
      return profile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getFavorites(id: number): Promise<Recipe[]> {
    try {
      const userFound = await this.findOne(id);

      return userFound.favorites;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async addToFavorites(userId: number, recipeId: number): Promise<User> {
    try {
      const userFound = await this.findOne(userId);

      const recipeFound = await this.recipeService.findOneRecipe(recipeId);
      recipeFound.favorites = recipeFound.favorites + 1;

      userFound.favorites.push(recipeFound);
      return this.userRepository.save(userFound);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeFromFavorites(userId: number, recipeId: number): Promise<User> {
    try {
      const userFound = await this.findOne(userId);

      const userFavorites = await this.getFavorites(userId);

      const recipeFound = await this.recipeService.findOneRecipe(recipeId);
      recipeFound.favorites = recipeFound.favorites - 1;

      const updatedRecipes = userFavorites.filter(
        (recipe) => recipe.id !== recipeId,
      );

      if (updatedRecipes.length === userFavorites.length)
        throw new HttpException(
          'Recipe not found in favorites',
          HttpStatus.NOT_FOUND,
        );

      const updatedUser = Object.assign(userFound, {
        favorites: updatedRecipes,
      });
      return this.userRepository.save(updatedUser);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Service Unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async findByIngredients(
    ingredients: string[],
    orderBy: 'default' | 'country' = 'default',
  ): Promise<Recipe[]> {
    return this.recipeService.findByIngredients(ingredients, orderBy);
  }
}

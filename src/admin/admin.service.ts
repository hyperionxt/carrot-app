import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { PaginationQueryDto } from '../pagination/pagination-query.dto';
import { CreateRecipeDto } from '../recipes/dto/create-recipe.dto';
import { UpdateRecipeDto } from '../recipes/dto/update-recipe.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecipesService } from '../recipes/recipes.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private userService: UsersService,
    private recipeService: RecipesService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  createUser(user: CreateUserDto): Promise<User> {
    return this.userService.createUser(user);
  }

  findAllUsers(pagination: PaginationQueryDto): Promise<User[]> {
    return this.userService.findAll(pagination);
  }

  findOneUser(id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  async updateUser(id: number, user: AdminUpdateUserDto): Promise<User> {
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

  removeUser(id: number): Promise<HttpException> {
    return this.userService.removeByAdmin(id);
  }

  createRecipe(recipe: CreateRecipeDto): Promise<Recipe> {
    return this.recipeService.createRecipe(recipe);
  }

  findAllRecipes(pagination: PaginationQueryDto): Promise<Recipe[]> {
    return this.recipeService.findAllRecipes(pagination);
  }

  updateRecipe(id: number, recipe: UpdateRecipeDto):Promise<Recipe> {
    return this.recipeService.updateRecipe(id, recipe);
  }

  removeRecipe(id: number): Promise<HttpException> {
    return this.recipeService.removeRecipe(id);
  }
}

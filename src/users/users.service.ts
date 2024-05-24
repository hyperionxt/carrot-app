import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly eventEmitter: EventEmitter2,
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
      this.eventEmitter.emit('userCreated');

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
      const key = 'allUsers-key';
      const usersCached = await this.cacheManager.get<User[]>(key);
      if (usersCached) return usersCached;
      const allUsers = await this.userRepository.find({
        skip: offset,
        take: limit,
      });
      if (allUsers.length === 0)
        throw new HttpException(
          'There are no users registered yet',
          HttpStatus.NO_CONTENT,
        );
      await this.cacheManager.set(key, allUsers);
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
      const key = `userFound-key-${id}`;
      const userCached = await this.cacheManager.get<User>(key);
      if (userCached) return userCached;
      const userFound = await this.userRepository.findOne({
        where: { id: id },
        relations: ['favorites'],
      });
      if (!userFound)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      await this.cacheManager.set(key, userFound);
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

      this.eventEmitter.emit('userUpdated', userFound.id);
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
      this.eventEmitter.emit('userUpdated', id);
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
      this.eventEmitter.emit('userUpdated', id);
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
      const key = `userProfile-key-${id}`;
      const userCached = await this.cacheManager.get<Profile>(key);
      if (userCached) return userCached;
      const userFound = await this.userRepository.findOne({
        where: { id: id },
        relations: ['favorites'],
      });
      if (!userFound)
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      const profile = {
        name: userFound.name,
        lastname: userFound.lastname,
        email: userFound.email,
        createdAt: userFound.createdAt,
      };
      await this.cacheManager.set(key, profile);

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
      const key = `userFavorites-key${id}`;
      const favoritesCached = await this.cacheManager.get<Recipe[]>(key);
      if (favoritesCached) return favoritesCached;
      const userFound = await this.findOne(id);
      await this.cacheManager.set(key, userFound.favorites);
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

      this.eventEmitter.emit('userUpdated', userId);
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
      const favorites = this.userRepository.save(updatedUser);
      this.eventEmitter.emit('userUpdated', userFound.id);
      return favorites;
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

  async createAdminUser() {
    try {
      const adminFound = await this.userRepository.findOne({
        where: {
          role: Role.ADMIN,
        },
      });

      if (adminFound) {
        Logger.log('Admin user already exists.');
        return;
      }

      const name = 'admin';
      const email = 'admin@potato.com';
      const password = 'passwordBeLike#43';
      const role = Role.ADMIN;

      const newAdmin = this.userRepository.create({
        name,
        email,
        password: await hash(password, 10),
        role,
      });

      Logger.log(
        `Admin profile created successfully!\n
        Email: ${email}\n
        Password: ${password}\n
        You can sign in with these credentials`,
      );

      await this.userRepository.save(newAdmin);
    } catch (e) {
      Logger.error('Error creating admin user: ', e);
    }
  }

  @OnEvent('userDeleted')
  async handleUserDeletedEvent(user: User) {
    const userFavoritesKey = `userFavorites-key${user.id}`;
    const userKey = `userFound-key-${user.id}`;
    const allUsersKey = 'allUsers-key';
    await this.cacheManager.del(allUsersKey);
    await this.cacheManager.del(userKey);
    await this.cacheManager.del(userFavoritesKey);
  }

  @OnEvent('userCreated')
  async handleUserCreatedEvent() {
    const allUsersKey = 'allUsers-key';
    await this.cacheManager.del(allUsersKey);
  }
  @OnEvent('userUpdated')
  async userUpdateEvent(id: number) {
    const profileKey = `userProfile-key${id}`;
    const userFavoritesKey = `userFavorites-key${id}`;
    const userKey = `userFound-key-${id}`;
    const key = 'allUsers-key';
    await this.cacheManager.del(key);
    await this.cacheManager.del(userKey);
    await this.cacheManager.del(profileKey);
    await this.cacheManager.del(userFavoritesKey);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../pagination/pagination-query.dto';
import { CreateRecipeDto } from '../recipes/dto/create-recipe.dto';
import { UpdateRecipeDto } from '../recipes/dto/update-recipe.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('create')
  createUser(@Body() user: CreateUserDto): Promise<User> {
    return this.adminService.createUser(user);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('users')
  findAllUsers(@Query() pagination: PaginationQueryDto): Promise<User[]> {
    return this.adminService.findAllUsers(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('users/:id')
  findOneUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.adminService.findOneUser(id);
  }
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: AdminUpdateUserDto,
  ): Promise<User> {
    return this.adminService.updateUser(id, user);
  }
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Delete('users/:id')
  removeUser(@Param('id', ParseIntPipe) id: number): Promise<HttpException> {
    return this.adminService.removeUser(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('newRecipe')
  createRecipe(@Body() recipe: CreateRecipeDto): Promise<Recipe> {
    return this.adminService.createRecipe(recipe);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('recipes')
  findAllRecipes(@Query() pagination: PaginationQueryDto): Promise<Recipe[]> {
    return this.adminService.findAllRecipes(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Patch('updateRecipe/:id')
  updateRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Body() recipe: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.adminService.updateRecipe(id, recipe);
  }
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Delete('deleteRecipe/:id')
  removeRecipe(@Param('id', ParseIntPipe) id: number): Promise<HttpException> {
    return this.adminService.removeRecipe(id);
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Recipe } from 'src/recipes/entities/recipe.entity';
import { Payload } from 'src/types';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: Payload) {
    return this.usersService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('update')
  update(@Body() updateUserDto: UpdateUserDto, @Request() req: Payload) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete('delete')
  remove(@Request() req: Payload) {
    return this.usersService.remove(req.user.id);
  }
  @Get('/findByIngredients')
  findByIngredients(
    @Query('ingredients', ParseArrayPipe) ingredients: string[],
    @Query('orderBy') orderBy: 'default' | 'country' = 'default',
  ): Promise<Recipe[]> {
    return this.usersService.findByIngredients(ingredients, orderBy);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('favorites')
  getFavorites(@Request() req: Payload): Promise<Recipe[]> {
    return this.usersService.getFavorites(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('/add/:id')
  addToFavorites(
    @Request() req: Payload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return this.usersService.addToFavorites(req.user.id, id);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('/remove/:id')
  removeFromfavorites(
    @Request() req: Payload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<User> {
    return this.usersService.removeFromFavorites(req.user.id, id);
  }
}

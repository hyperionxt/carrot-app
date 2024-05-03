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
import { PaginationQueryDto } from 'src/pagination/pagination-query.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('create')
  create(@Body() user: CreateUserDto): Promise<User> {
    return this.adminService.create(user);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('users')
  findAll(@Query() pagination: PaginationQueryDto): Promise<User[]> {
    return this.adminService.findAll(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.adminService.findOne(id);
  }
  //@ApiBearerAuth()
  //@UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() user: AdminUpdateUserDto,
  ): Promise<User> {
    return this.adminService.update(id, user);
  }
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<HttpException> {
    return this.adminService.remove(id);
  }
}

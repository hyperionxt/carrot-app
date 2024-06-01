import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/sign-in.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { SignInGuard } from './guards/auth-sign-in.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiBearerAuth()
  @UseGuards(SignInGuard)
  @Post('signup')
  registerUser(@Body() user: CreateUserDto): Promise<User> {
    return this.authService.signupUser(user);
  }
  @ApiBearerAuth()
  @UseGuards(SignInGuard)
  @Post('signin')
  loginUser(@Body() user: LoginUserDto): Promise<{ token: string }> {
    return this.authService.signinUser(user);
  }

  
}

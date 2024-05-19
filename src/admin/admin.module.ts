import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesModule } from '../recipes/recipes.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule, RecipesModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [],
})
export class AdminModule {}

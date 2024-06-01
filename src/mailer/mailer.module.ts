import { MailerModule as MailerModuleConfig } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  JWT_SECRET_KEY,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_USERNAME,
} from '../config/vars.config';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { MailerController } from './mailer.controller';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    MailerModuleConfig.forRoot({
      transport: {
        host: MAIL_HOST,
        auth: {
          user: MAIL_USERNAME,
          pass: MAIL_PASSWORD,
        },
      },
    }),
    JwtModule.register({
      global: true,
      secret: JWT_SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
    UsersModule,
  ],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}

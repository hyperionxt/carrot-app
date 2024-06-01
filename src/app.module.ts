import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { redisStore } from 'cache-manager-redis-yet';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import {
  DB_HOST,
  DB_NAME,
  DB_NAME_TEST,
  DB_PASSWORD,
  DB_PORT,
  DB_TYPE,
  DB_USERNAME,
  ENV,
  REDIS_HOST,
  REDIS_LOCAL_PORT,
} from './config/vars.config';

import { MailerModule } from './mailer/mailer.module';
import { RecipesModule } from './recipes/recipes.module';
import { UsersModule } from './users/users.module';
import { DatabaseBackupAutoTask } from './utils/tasks-schedule/backups.autotask';

const dbName = ENV === 'test' ? DB_NAME_TEST : DB_NAME;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: DB_TYPE,
      host: DB_HOST,
      port: DB_PORT,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: dbName,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: REDIS_HOST,
            port: REDIS_LOCAL_PORT,
          },
        }),
      }),
    }),
    EventEmitterModule.forRoot(),
    // MailerModuleConfig.forRoot({
    //   transport: {
    //     host: MAIL_HOST,
    //     auth: {
    //       user: MAIL_USERNAME,
    //       pass: MAIL_PASSWORD,
    //     },
    //   },
    // }),
    UsersModule,
    AuthModule,
    AdminModule,
    RecipesModule,
    MailerModule,
  ],
  controllers: [],
  providers: [DatabaseBackupAutoTask],
  exports: [],
})
export class AppModule {}

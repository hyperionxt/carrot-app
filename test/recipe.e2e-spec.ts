import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Recipe } from '../src/recipes/entities/recipe.entity';

import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { REDIS_HOST, REDIS_LOCAL_PORT } from '../src/config/vars.config';
import { TestLogger } from './helpers/auth.helpers';
import { initialRecipesTop } from './helpers/recipe.helpers';

let app: INestApplication;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      AppModule,
      CacheModule.registerAsync({
        isGlobal: true,
        useFactory: async () => ({
          store: await redisStore({
            socket: {
              host: REDIS_HOST,
              port: REDIS_LOCAL_PORT
            },
          }),
        }),
      }),
    ],
  }).compile();

  app = moduleFixture.createNestApplication();
  app.useLogger(new TestLogger());
  await app.init();
});

beforeEach(async () => {
  const data = app.get(DataSource);
  await data.createQueryBuilder().delete().from(Recipe).execute();
  await data.query('ALTER SEQUENCE recipes_id_seq RESTART WITH 1');

  await data
    .createQueryBuilder()
    .insert()
    .into(Recipe)
    .values(initialRecipesTop)
    .execute();
});

describe('GET /recipes/topThree', () => {
  it('it should return three recipes with +100 favorites and +50 clicks as minumum', async () => {
    const response = await request(app.getHttpServer())
      .get('/recipes/topThree')
      .expect(200);
    expect(response.body).toHaveLength(3);
  });
});

afterAll(async () => {
  await app.close();
});

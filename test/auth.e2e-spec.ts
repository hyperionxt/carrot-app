import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { REDIS_HOST, REDIS_LOCAL_PORT } from '../src/config/vars.config';
import { User } from '../src/users/entities/user.entity';
import {
  TestLogger,
  emptyPasswordEmail,
  initialUser,
  invalidFormatEmail,
  newUser,
  newUserEmailUsed,
  newUserWithoutEmail,
  newUserWithoutPass,
  thisUserDoesNotExist,
} from './helpers/auth.helpers';

let app: INestApplication;
let jwt: JwtService;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [
      AppModule,
      CacheModule.registerAsync({
        isGlobal: true,
        useFactory: async () => ({
          socket: {
            host: REDIS_HOST,
            port: REDIS_LOCAL_PORT,
          },
        }),
      }),
    ],
    providers: [JwtService],
  }).compile();

  jwt = moduleFixture.get<JwtService>(JwtService);

  app = moduleFixture.createNestApplication();
  app.useLogger(new TestLogger());
  await app.init();
});

beforeEach(async () => {
  const data = app.get(DataSource);
  await data.createQueryBuilder().delete().from(User).execute();
  await data.query('ALTER SEQUENCE recipes_id_seq RESTART WITH 1');

  const hashedUsers = await Promise.all(
    initialUser.map(async (user) => {
      const passwordHash = await hash(user.password, 10);
      return { ...user, password: passwordHash };
    }),
  );
  await data
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(hashedUsers)
    .execute();
});
describe('POST /auth/signup', () => {
  it('it should register a new user and return it as JSON', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);
  });

  it('register without password returns 400 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUserWithoutPass)
      .expect(400);
  });
  it('register without email returns 409 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUserWithoutEmail)
      .expect(400);
  });
  it('register with nonformat email returns 409 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(invalidFormatEmail)
      .expect(400);
  });
  it('register with an email that already exists, returns 409 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send(newUserEmailUsed)
      .expect(409);
  });
});

describe('POST /auth/signin', () => {
  it('it should login an user and returns a token as JSON', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(initialUser[0])
      .expect(201);
    expect(response.header['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('token');
  });
  it('nonexistent user returns a 401 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(thisUserDoesNotExist)
      .expect(401);
  });
  it('empty password or email, returns a 401 status code', async () => {
    await request(app.getHttpServer())
      .post('/auth/signin')
      .send(emptyPasswordEmail)
      .expect(401);
  });
});

afterAll(async () => {
  await app.close();
});

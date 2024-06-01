import { CacheModule } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { redisStore } from 'cache-manager-redis-yet';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { REDIS_HOST, REDIS_LOCAL_PORT } from '../src/config/vars.config';
import { Recipe } from '../src/recipes/entities/recipe.entity';
import { User } from '../src/users/entities/user.entity';
import { TestLogger } from './helpers/auth.helpers';
import {
  initialRecipesFav,
  initialUsersProfile,
  userLogin,
  userLoginTwo,
} from './helpers/user.helpers';

let app: INestApplication;
let jwt: JwtService;

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
              port: REDIS_LOCAL_PORT,
            },
          }),
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
  await data.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await data.createQueryBuilder().delete().from(Recipe).execute();
  await data.query('ALTER SEQUENCE recipes_id_seq RESTART WITH 1');

  const hashedUsers = await Promise.all(
    initialUsersProfile.map(async (user) => {
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

  await data
    .createQueryBuilder()
    .insert()
    .into(Recipe)
    .values(initialRecipesFav)
    .execute();
});

describe('GET /users/profile', () => {
  it('should return a profile user as JSON using its id from the token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userLogin)
      .expect(201);
    expect(response.header['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('token');
    const userFound = await request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(200);
    expect(userFound.body.name).toContain('user1');
    expect(userFound.body.lastname).toContain('lastname1');
    expect(userFound.body.email).toContain('user1@gmail.com');
  });
  it('should return a 401 status code due to users need to sign in first', async () => {
    const userFound = await request(app.getHttpServer())
      .get('/users/profile')
      .expect(401);
    expect(userFound.body.message).toContain('You must sign in first');
  });
});

describe('PATCH /users/update', () => {
  it('should return an updated profile', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userLogin)
      .expect(201);
    expect(response.header['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('token');
    const userFound = await request(app.getHttpServer())
      .patch('/users/update')
      .set('Authorization', `Bearer ${response.body.token}`)
      .send({
        name: 'updateduser',
        lastname: 'updatedlastname',
        email: 'updatedemail@gmail.com',
        oldPassword: 'POTATOpass#1',
        newPassword: 'UPDATEDpass#1',
      })
      .expect(200);
    expect(userFound.body.name).toContain('updateduser');
    expect(userFound.body.lastname).toContain('updatedlastname');
    expect(userFound.body.email).toContain('updatedemail@gmail.com');

    const responseSignin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'updatedemail@gmail.com',
        password: 'UPDATEDpass#1',
      })
      .expect(201);
    expect(responseSignin.header['content-type']).toContain('application/json');
    expect(responseSignin.body).toHaveProperty('token');
  });
});

describe('DELETE /users/delete', () => {
  it('should be able to users delete their own account', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userLogin)
      .expect(201);
    expect(response.header['content-type']).toContain('application/json');
    expect(response.body).toHaveProperty('token');
    const userFound = await request(app.getHttpServer())
      .delete('/users/delete')
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(200);
    expect(userFound.body.message).toEqual('User deleted successfully');
    const responseSignin = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userLogin)
      .expect(401);
    expect(responseSignin.body.message).toEqual(
      'Invalid combination of email and password or this account does not exist',
    );
  });
});

describe('GET /users/findByIngredients', () => {
  it('should return recipes using ingredients as parameters by a query', async () => {
    const ingredients = 'ingr1,ingr4';
    const response = await request(app.getHttpServer())
      .get('/users/recipes/findByIngredients')
      .query({ ingredients: ingredients })
      .expect(200);
    expect(response.body).toHaveLength(2);
    response.body.forEach((recipe: Recipe) => {
      expect(recipe.ingredients).toContain('ingr1');
      expect(recipe.ingredients).toContain('ingr4');
    });
  });
});

describe('POST /users/recipe/add/:id', () => {
  it('should let users add recipes to their favorites list', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userLogin)
      .expect(201);

    const ingredients = 'ingr1,ingr4';
    const recipesFound = await request(app.getHttpServer())
      .get('/users/recipes/findByIngredients')
      .query({ ingredients: ingredients })
      .expect(200);

    await request(app.getHttpServer())
      .post(`/users/recipe/add/${recipesFound.body[0].id}`)
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(201);

    const userFound = await request(app.getHttpServer())
      .get('/users/favorites')
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(200);

    expect(userFound.body[0].id).toBe(recipesFound.body[0].id);
    expect(userFound.body[0].title).toBe(recipesFound.body[0].title);
  });
});

describe('PATCH /users/recipe/add/:id', () => {
  it('should remove a recipe from favorite list of users', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send(userLoginTwo)
      .expect(201);

    const ingredients = 'ingr1,ingr4';
    const recipesFound = await request(app.getHttpServer())
      .get('/users/recipes/findByIngredients')
      .query({ ingredients: ingredients })
      .expect(200);

    const potato = await request(app.getHttpServer())
      .post(`/users/recipe/add/${recipesFound.body[0].id}`)
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(201);

    const removeRe = await request(app.getHttpServer())
      .patch(`/users/recipe/remove/${recipesFound.body[0].id}`)
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(200);

    const userFound = await request(app.getHttpServer())
      .get('/users/favorites')
      .set('Authorization', `Bearer ${response.body.token}`)
      .expect(200);
    expect(userFound.body).toHaveLength(0);
  });
});

afterAll(async () => {
  await app.close();
});

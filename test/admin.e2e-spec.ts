import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { hash } from 'bcrypt';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Recipe } from '../src/recipes/entities/recipe.entity';
import { User } from '../src/users/entities/user.entity';
import { initialAdminUsers, initialRecipes, newRecipe } from './helpers/admin.helpers';
import { TestLogger, newUser } from './helpers/auth.helpers';


let app: INestApplication;
let jwt: JwtService;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
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
  const hashedUser = await Promise.all(
    initialAdminUsers.map(async (user) => {
      const passwordHash = await hash(user.password, 10);
      return { ...user, password: passwordHash };
    }),
  );

  await data
    .createQueryBuilder()
    .insert()
    .into(User)
    .values(hashedUser)
    .execute();

  await data
    .createQueryBuilder()
    .insert()
    .into(Recipe)
    .values(initialRecipes)
    .execute();
});

describe('POST /admin/create/', () => {
  it('it should let create a new user being administrator', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const response = await request(app.getHttpServer())
      .post('/admin/create')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
  });

  it('nonadmin users can not access to this route', async () => {
    const token = jwt.sign(initialAdminUsers[1]);
    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    expect(response.body.message).toBe('Insufficient Permissions');
  });
});

describe('GET /admin/users/', () => {
  it('should return all users available on database. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(response.body).toHaveLength(initialAdminUsers.length);
  });
  it('nonadmin users can not access to this route', async () => {
    const token = jwt.sign(initialAdminUsers[1]);
    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    expect(response.body.message).toBe('Insufficient Permissions');
  });
});

describe('GET /admin/users/:id', () => {
  it('should return an user object by its id. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const postResponse = await request(app.getHttpServer())
      .post('/admin/create')
      .send(newUser)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    const userId = postResponse.body.id;
    const getResponse = await request(app.getHttpServer())
      .get(`/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getResponse.body.id).toBe(userId);
  });
  it('invalid id returns 404 status code. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const userId = 999;
    const response = await request(app.getHttpServer())
      .get(`/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(response.body.message).toBe('User not found');
  });
  it('nonadmin user returns 401 status code', async () => {
    const token = jwt.sign(initialAdminUsers[1]);
    const userId = 999;
    const response = await request(app.getHttpServer())
      .get(`/admin/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    expect(response.body.message).toBe('Insufficient Permissions');
  });
});

describe('PATCH /admin/users/:id', () => {
  it('should return an user object updated. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const getResponse = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const userFound = getResponse.body[0].id;
    const patchResponse = await request(app.getHttpServer())
      .patch(`/admin/users/${userFound}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'test',
        email: 'potato@gmail.com',
        oldPassword: 'POTATOpass#1',
        newPassword: 'ONIONtomato##123',
      })
      .expect(200);
    expect(patchResponse.body.name).toBe('test');
    expect(patchResponse.body.email).toBe('potato@gmail.com');

    await request(app.getHttpServer())
      .post(`/auth/signin`)
      .send({
        email: 'potato@gmail.com',
        password: 'POTATOpass#1',
      })
      .expect(401);

    const responsePassUpdated = await request(app.getHttpServer())
      .post(`/auth/signin`)
      .send({
        email: 'potato@gmail.com',
        password: 'ONIONtomato##123',
      })
      .expect(201)
      .expect('Content-Type', /application\/json/);
    expect(responsePassUpdated.body).toHaveProperty('token');
  });

  it('non admin users can not use this route.', async () => {
    const potatoId = 10;
    const token = jwt.sign(initialAdminUsers[1]);
    const response = await request(app.getHttpServer())
      .patch(`/admin/users/${potatoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'test', email: 'potato@gmail.com' })
      .expect(401);
    expect(response.body.message).toBe('Insufficient Permissions');
  });
});

describe('DELETE /admin/users/:id', () => {
  it('should delete an user object. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const getResponse = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const userFound = getResponse.body[1].id;
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/admin/users/${userFound}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(deleteResponse.body.message).toBe('User deleted successfully');
    const getResponse2 = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getResponse2.body).toHaveLength(initialAdminUsers.length - 1);
  });
  it('non admin users can not use this route.', async () => {
    const potatoId = 999;
    const token = jwt.sign(initialAdminUsers[1]);
    const response = await request(app.getHttpServer())
      .delete(`/admin/users/${potatoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    expect(response.body.message).toBe('Insufficient Permissions');
  });
});

describe('POST /admin/newRecipe', () => {
  it('should return a new recipe object as JSON. only for admin user', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const response = await request(app.getHttpServer())
      .post('/admin/newRecipe')
      .set('Authorization', `Bearer ${token}`)
      .send(newRecipe)
      .expect(201);
  });
  it('nonadmin users can not use this route', async () => {
    const token = jwt.sign(initialAdminUsers[1]);
    await request(app.getHttpServer())
      .post('/admin/newRecipe')
      .set('Authorization', `Bearer ${token}`)
      .send(newRecipe)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
  it('should return conflic status code 409, can not be two recipes with same name', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    await request(app.getHttpServer())
      .post('/admin/newRecipe')
      .set('Authorization', `Bearer ${token}`)
      .send(initialRecipes[0])
      .expect(409)
      .expect('Content-Type', /application\/json/);
  });
});

describe('GET /admin/recipes', () => {
  it('should return an array of JSON recipes objects. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    await request(app.getHttpServer())
      .get('/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
  it('nonadmin users can not use this route', async () => {
    const token = jwt.sign(initialAdminUsers[1]);
    await request(app.getHttpServer())
      .get('/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
      .expect('Content-Type', /application\/json/);
  });
});

describe('PATCH /updateRecipes/:id', () => {
  it('should return an user object updated. only for admin users', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const getResponse = await request(app.getHttpServer())
      .get('/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const recipeFound = getResponse.body[0].id;

    await request(app.getHttpServer())
      .patch(`/admin/updateRecipe/${recipeFound}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'title10',
        country: 'country10',
        description: 'description10',
        ingredients: ['ingr10', 'ingr11', 'ingr12'],
        instructions: 'instructions10',
      })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/admin/recipes`)
      .set('Authorization', `Bearer ${token}`);
    const recipeTitle = response.body.map((recipe: Recipe) => recipe.title);
    expect(recipeTitle).toContain('title10');
    const recipeCountry = response.body.map((recipe: Recipe) => recipe.country);
    expect(recipeCountry).toContain('country10');
    const recipeDesc = response.body.map(
      (recipe: Recipe) => recipe.description,
    );
    expect(recipeDesc).toContain('description10');
    const recipeIngr = response.body.map(
      (recipe: Recipe) => recipe.ingredients,
    );
    expect(recipeIngr).toContainEqual(['ingr10', 'ingr11', 'ingr12']);
    const recipeInstr = response.body.map(
      (recipe: Recipe) => recipe.instructions,
    );
    expect(recipeInstr).toContain('instructions10');
  });

  it('non admin users are allowed to use this route, should return status code 401', async () => {
    const token = jwt.sign(initialAdminUsers[1]);

    const recipeFound = 999;

    await request(app.getHttpServer())
      .patch(`/admin/updateRecipe/${recipeFound}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'title10',
        country: 'country10',
        description: 'description10',
        ingredients: ['ingr10', 'ingr11', 'ingr12'],
        instructions: 'instructions10',
      })
      .expect(401);
  });
});

describe('DELETE /admin/deleteRecipe/:id', () => {
  it('it should delete a recipe from database', async () => {
    const token = jwt.sign(initialAdminUsers[0]);
    const getResponse = await request(app.getHttpServer())
      .get('/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const recipeFound = getResponse.body[1].id;
    const deleteResponse = await request(app.getHttpServer())
      .delete(`/admin/deleteRecipe/${recipeFound}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(deleteResponse.body.message).toBe('Recipe deleted');
    const getResponse2 = await request(app.getHttpServer())
      .get('/admin/recipes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(getResponse2.body).toHaveLength(initialAdminUsers.length - 1);
  });
  it('non admin users can not use this route. should return 401', async () => {
    const token = jwt.sign(initialAdminUsers[1]);
    const recipeFound = 999;
    await request(app.getHttpServer())
      .delete(`/admin/deleteRecipe/${recipeFound}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });
});
afterAll(async () => {
  await Promise.all([app.close()]);
});

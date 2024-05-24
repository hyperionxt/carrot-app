import { Role } from '../../src/users/entities/user.entity';

export const initialUsersProfile = [
  {
    name: 'user1',
    lastname: 'lastname1',
    email: 'user1@gmail.com',
    password: 'POTATOpass#1',
    role: Role.REGULAR,
  },
  {
    name: 'user2',
    lastname: 'lastname1',
    email: 'user2@gmail.com',
    password: 'POTATOpass#1',
    role: Role.REGULAR,
  },
];

export const userLogin = {
  email: 'user1@gmail.com',
  password: 'POTATOpass#1',
};

export const userLoginTwo = {
  email: 'user2@gmail.com',
  password: 'POTATOpass#1',
};

export const initialRecipesFav = [
  {
    title: 'title1',
    country: 'country1',
    description: 'description1',
    ingredients: ['ingr1', 'ingr2', 'ingr4'],
    instructions: 'instructions1',
  },

  {
    title: 'title2',
    country: 'country2',
    description: 'description2',
    ingredients: ['ingr5', 'ingr2', 'ingr1'],
    instructions: 'instructions2',
  },
  {
    title: 'title5',
    country: 'country5',
    description: 'description5',
    ingredients: ['ingr1', 'ingr5', 'ingr4'],
    instructions: 'instructions5',
  },
  {
    title: 'title7',
    country: 'country7',
    description: 'description7',
    ingredients: ['ingr4', 'ingr2', 'ingr9'],
    instructions: 'instructions5',
  },
];

import { Role } from "../../src/users/entities/user.entity";


export const initialAdminUsers = [
  {
    name: 'admin1',
    email: 'admin1@gmail.com',
    password: 'POTATOpass#1',
    role: Role.ADMIN,
  },
  {
    name: 'noadmin1',
    email: 'noadmin1@gmail.com',
    password: 'POTATOpass#1',
    role: Role.REGULAR,
  },
];

export const newUser = {
  name: 'name10',
  email: 'name10@gmail.com',
  password: 'POTAtopass#31',
  role: Role.REGULAR,
};

export const initialRecipes = [
  {
    title: 'title1',
    country: 'country1',
    description: 'description1',
    ingredients: ['ingr1', 'ingr2', 'ingr3'],
    instructions: 'instructions1',
  },

  {
    title: 'title2',
    country: 'country2',
    description: 'description2',
    ingredients: ['ingr1', 'ingr2', 'ingr3'],
    instructions: 'instructions1',
  },
];

export const newRecipe = {
  title: 'title3',
  country: 'country2',
  description: 'description2',
  ingredients: ['ingr1', 'ingr2', 'ingr3'],
  instructions: 'instructions1',
};

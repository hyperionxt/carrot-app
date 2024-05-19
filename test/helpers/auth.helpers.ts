import { LoggerService } from '@nestjs/common';
import { Role } from '../../src/users/entities/user.entity';

export class TestLogger implements LoggerService {
  log(message: string) {}
  error(message: string, trace: string) {}
  warn(message: string) {}
  debug(message: string) {}
  verbose(message: string) {}
}
export const initialUser = [
  {
    name: 'name1',
    email: 'email1@gmail.com',
    password: 'POTATOpass#1',
    role: Role.REGULAR,
  },
  {
    name: 'name2',
    email: 'email2@gmail.com',
    password: 'POTATOpass#1',
    role: Role.REGULAR,
  },
];
export const newUser = {
  name: 'name3',
  email: 'email3@gmail.com',
  password: 'POTATOpass#1',
};

export const newUserWithoutPass = {
  name: 'troll1',
  email: 'email3@gmail.com',
  password: '',
};
export const newUserWithoutEmail = {
  name: 'troll2',
  email: '',
  password: 'POTATOpass#1',
};
export const newUserEmailUsed = {
  name: 'troll3',
  email: 'email1@gmail.com',
  password: 'POTATOpass#1',
};

export const thisUserDoesNotExist = {
  email: 'troll4@gmail.com',
  password: 'POTATOpass#1',
};

export const emptyPasswordEmail = {
  email: '',
  password: '',
};
export const invalidFormatEmail = {
  email: 'troll5@@@@@',
  password: 'POTATOpass#1',
};



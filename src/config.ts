import { ConfigModule } from '@nestjs/config';
import { DbType } from './types';

ConfigModule.forRoot();

/*DB_SETUP*/
export const DB_TYPE: DbType = process.env.DB_TYPE as DbType;
export const DB_PORT = parseInt(process.env.DB_PORT);
export const DB_HOST = process.env.DB_HOST;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME_PROD = process.env.DB_NAME_PROD;
export const DB_NAME_TEST = process.env.DB_NAME_TEST;
/*JWT*/
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

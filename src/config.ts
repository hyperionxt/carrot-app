import { ConfigModule } from '@nestjs/config';
import { SqlDatabase } from './types/db.type';
const { NODE_ENV } = process.env;

ConfigModule.forRoot();
//APP_SETUP
export const APP_PORT: number = parseInt(process.env.APP_PORT);

/*DB_SETUP*/
export const DB_TYPE: SqlDatabase = process.env.DB_TYPE as SqlDatabase;
export const DB_PORT = parseInt(process.env.DB_PORT);
export const DB_HOST = process.env.DB_HOST;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_NAME_TEST = process.env.DB_NAME_TEST;
/*JWT*/
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

//DEV, PROD, TEST
export const ENV = NODE_ENV;

//BACKUPS
export const DUMP_PATH = process.env.DUMP_PATH;
export const BACKUP_PATH = process.env.BACKUP_PATH;

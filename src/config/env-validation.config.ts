import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string(),
  DB_PORT: z.string(),
  DB_TYPE: z.string(),
  DB_HOST: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  //DB_NAME_TEST: z.string(),
  JWT_SECRET_KEY: z.string(),
  //DUMP_PATH: z.string(),
  //BACKUP_PATH: z.string(),
  REDIS_HOST: z.string(),
  REDIS_LOCAL_PORT: z.string(),
  //REDIS_CONTAINER_NAME: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.string(),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),

});

envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

import { z } from 'zod';

const envSchema = z.object({
  APP_PORT: z.string(),
  DB_PORT: z.string(),
  DB_TYPE: z.string(),
  DB_HOST: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_NAME_TEST: z.string(),
  JWT_SECRET_KEY: z.string(),
  DUMP_PATH: z.string(),
  BACKUP_PATH: z.string(),
});

envSchema.parse(process.env);

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envSchema> {}
    }
}

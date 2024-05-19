import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import './config/env-validation.config';
import { APP_PORT } from './config/vars.config';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    app.use(helmet());
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('API Documentation')
      .setDescription('The carrot API description')
      .setVersion('1.0')
      .addTag('Authentication', 'Authentication system by JWT')
      .addTag('Users', 'All that users are allowed to do')
      .addTag('Recipes', 'Recipes Management')
      .addTag('Admin', 'General Management')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/doc', app, document);

    await app.listen(APP_PORT);
  } catch (e) {
    throw new Error(e);
  }
}
bootstrap();

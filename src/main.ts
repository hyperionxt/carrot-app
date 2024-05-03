import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

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
      .addTag('Authentication', 'Authentication system')
      .addTag('Users', 'All that users are allowed to do')
      .addTag('Recipes', 'Recipes Management')
      .addTag('Admin', 'Everything that administrators can do')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/doc', app, document);
    await app.listen(3000);
  } catch (e) {
    throw new Error(e);
  }
}
bootstrap();

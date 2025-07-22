import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);
  const config = new DocumentBuilder()
    .setTitle('@tdev/toolkit Swagger')
    .setDescription('Toolkit API routes and modules')
    .setVersion('v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.paths = Object.keys(document.paths).reduce((acc, path) => {
    acc[`/api/v1${path}`] = document.paths[path];
    return acc;
  }, {});

  SwaggerModule.setup('api/v1', app, document, {
    jsonDocumentUrl: 'api/docs/openapi.json',
    useGlobalPrefix: true,
  });

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();

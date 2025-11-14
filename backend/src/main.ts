// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //remove campos que não estão no DTO
    forbidNonWhitelisted: true, //lança erro se campos extras forem enviados
    transform: true, //transforma os tipos
  }));

  await app.listen(3000);
}
bootstrap();

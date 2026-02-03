/**
 * File: main.ts
 * Author: Kavishka Piyumal
 * Created: 2026-01-30
 * Description:
 *   Entry point for the NestJS application. Initializes the app,
 *   configures CORS, global prefix, and starts the server.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(configService.get<number>('PORT') ?? 3002);
}
bootstrap();

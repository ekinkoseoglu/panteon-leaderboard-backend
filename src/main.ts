import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '1024mb' }));
  app.use(urlencoded({ extended: true, limit: '1024mb' }));
  await app.listen(process.env.PORT || '0.0.0.0');
}
bootstrap();

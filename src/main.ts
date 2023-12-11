import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // DONT DO THIS IN PROD CORE SETTINGS ARE MORE SOPHISTICATED
  app.enableCors({origin: "*"});

  app.use(json({limit: '50mb'}));
  app.use(urlencoded({extended: true, limit: '50mb'}));

  await app.listen(3000);
}
bootstrap();

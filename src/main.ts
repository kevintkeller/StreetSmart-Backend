import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';
import * as cookieParser from 'cookie-parser';
const cors = require('cors');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // DONT DO THIS IN PROD CORE SETTINGS ARE MORE SOPHISTICATED
  //pp.enableCors({origin: "*"});
  app.use(cookieParser());
  app.use(json({limit: '50mb'}));
  app.use(urlencoded({extended: true, limit: '50mb'}));
  const corsOptions ={
      origin:'http://localhost:4200', 
      credentials:true,            //access-control-allow-credentials:true
      optionSuccessStatus:200
  }
  app.use(cors(corsOptions));

  await app.listen(3000);
}
bootstrap();

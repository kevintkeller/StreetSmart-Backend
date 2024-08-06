import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';
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
      // origin: 'http://192.168.3.113:4200',
      credentials:true,            //access-control-allow-credentials:true
      optionSuccessStatus:200
  }
  app.use(cors(corsOptions));
  // app.use((req, res, next) => {
  //   res.header("Access-Control-Allow-Origin", "http://192.168.1.206:4200"); // Or use "*" to allow any origin
  //   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  //   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
  //   next();
  // });

  await app.listen(3000);
}
bootstrap();

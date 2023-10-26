import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UserEntity } from './user/models/user.entity';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/report.module';
import { ReportEntity } from './report/models/report.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      //url: process.env.DATABASE_URL,
      host: 'wayne.cs.uwec.edu',
      port: 3306,
      username: 'KELLERKT5229',
      password: '7OIXBVME',
      database: 'cs485group6',
      entities: [UserEntity, ReportEntity],
      synchronize: true,
  }),
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    AuthModule,
    ReportModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

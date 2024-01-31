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
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      //url: process.env.DATABASE_URL,
      host: 'localhost',
      port: 3306,
      username: 'kkeller',
      password: 'Wigglytoes12981481920676$',
      database: 'roadreportlocal',
      entities: [UserEntity, ReportEntity],
      synchronize: true,
  }),
    ConfigModule.forRoot({isGlobal: true}),
    UserModule,
    AuthModule,
    ReportModule,
    MailerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

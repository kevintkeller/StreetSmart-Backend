import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ReportModule } from './report/report.module';
import { MailerModule } from './mailer/mailer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypedEventEmitter } from './event-emitter/typed-event-emitter.class';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({

        type: 'mysql',
        //url: process.env.DATABASE_URL,
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    EventEmitterModule.forRoot(),
    UserModule,
    AuthModule,
    ReportModule,
    MailerModule
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService, TypedEventEmitter],
})
export class AppModule {
  constructor(private readonly configService: ConfigService) {}
}

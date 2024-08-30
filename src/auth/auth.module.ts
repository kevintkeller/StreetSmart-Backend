import { ConfigModule, ConfigService } from '@nestjs/config';
import {  Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './service/auth.service';
import { AuthController } from './controllers/auth.controller';
import { AuthGuard } from '../common/guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationEntity } from './models/email-verification.entity';
import { TypedEventEmitter } from '../event-emitter/typed-event-emitter.class';
import { UserEntity } from 'src/user/models/user.entity';
import { UserVerifiedEntity } from 'src/user/models/user-verified.entity';
import { ForgotPasswordEntity } from './models/forgot-password.entity';
import { CognitoAuthController } from './controllers/cognito-auth.controller';
import { CognitoAuthService } from './service/cognito-auth.service';
import { CognitoAdminController } from './controllers/cognito-admin.controller';
import { CognitoAdminService } from './service/cognito-admin.service';
import { CityEntity } from './models/city.entity';
import { CityZipEntity } from './models/city-zip.entity';
import { CityService } from './service/city.service';

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [
                ConfigModule
            ],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                global: true,
                secret: configService.get('JWT_SECRET'),
                signOptions: {expiresIn: '100s'}
            })
        }),
        TypeOrmModule.forFeature([EmailVerificationEntity]),
        TypeOrmModule.forFeature([UserEntity]),
        TypeOrmModule.forFeature([UserVerifiedEntity]),
        TypeOrmModule.forFeature([ForgotPasswordEntity]),
        TypeOrmModule.forFeature([CityEntity]),
        TypeOrmModule.forFeature([CityZipEntity])
    ],
    providers: [
        AuthService,
        CognitoAuthService,
        CognitoAdminService,
        CityService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        TypedEventEmitter
    ],
    exports: [AuthService, CognitoAuthService, CognitoAdminService],
    controllers: [AuthController, CognitoAuthController, CognitoAdminController]
})
export class AuthModule {}

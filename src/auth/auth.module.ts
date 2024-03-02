import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './service/auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from '../common/guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationEntity } from './models/email-verification.entity';
import { TypedEventEmitter } from '../event-emitter/typed-event-emitter.class';
import { UserEntity } from 'src/user/models/user.entity';
import { UserVerifiedEntity } from 'src/user/models/user-verified.entity';

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
        TypeOrmModule.forFeature([UserVerifiedEntity])
    ],
    providers: [
        AuthService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        TypedEventEmitter
    ],
    exports: [AuthService],
    controllers: [AuthController]
})
export class AuthModule {}

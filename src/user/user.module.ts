import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AdminController } from './controller/admin.controller';
import { TypedEventEmitter } from 'src/event-emitter/typed-event-emitter.class';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { UserVerifiedEntity } from './models/user-verified.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserVerifiedEntity]),
    AuthModule,
    JwtModule
  ],
  providers: [UserService, TypedEventEmitter, AuthGuard],
  controllers: [UserController, AdminController],
  exports: [UserService, TypedEventEmitter]
})
export class UserModule {}

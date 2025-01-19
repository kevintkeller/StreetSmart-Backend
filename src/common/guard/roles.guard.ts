import { CognitoAuthService } from 'src/auth/service/cognito-auth.service';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { CognitoAdminService } from 'src/auth/service/cognito-admin.service';
import AWS from 'aws-sdk';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly cognitoAdminService: CognitoAdminService,
        private readonly configService: ConfigService,
        private readonly cognitoAuthService: CognitoAuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user; // Ensure the user object is set (typically by a JWT strategy)

        const username = await this.cognitoAuthService.getUsernameByEmail(user.email);
        
        if (!user) {
            throw new ForbiddenException('User not found');
        }

        const isAdmin = await this.cognitoAdminService.isUserInGroup(username, this.configService.get('COGNITO_USER_POOL_ID'), this.configService.get('ROLES_GROUP_NAME'));

        if (requiredRoles.includes('admin') && !isAdmin) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
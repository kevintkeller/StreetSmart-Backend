import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorator/roles.decorator";
import { RolesGuard } from "src/common/guard/roles.guard";
import { CognitoAdminService } from "../service/cognito-admin.service";
import { CognitoAuthService } from "../service/cognito-auth.service";
import { ConfigService } from "@nestjs/config";
import { AdminUser } from "../models/admin-user.model";


@Controller('cognito-admin')
@UseGuards(RolesGuard)
export class CognitoAdminController {

    constructor(private cognitoAdminService: CognitoAdminService,
                private cognitoAuthService: CognitoAuthService,
                private configService: ConfigService) {}

    @Get()
    @Roles('admin')
    public getAdminData() {
        return 'admin data';
    }

    @Post('is-admin')
    public async getIsAdmin(@Body() body: {email: string}): Promise<boolean> {
        const username: string = await this.cognitoAuthService.getUsernameByEmail(body.email);
        return await this.cognitoAdminService.isUserInGroup(username, this.configService.get('COGNITO_USER_POOL_ID'), this.configService.get('ROLES_GROUP_NAME'));
    }

    @Post('grant-admin')
    @Roles('admin')
    public async grantAdminStatus(@Body() body: {email: string}): Promise<boolean> {
        const username: string = await this.cognitoAuthService.getUsernameByEmail(body.email);
        return await this.cognitoAdminService.grantAdminStatus(username, this.configService.get('COGNITO_USER_POOL_ID'), this.configService.get('ROLES_GROUP_NAME'));
    }

    @Get('all-admins')
    @Roles('admin')
    public async getAllAdmins(@Query('cityId') cityId: string): Promise<AdminUser[]> {
        return await this.cognitoAdminService.getAllAdmins(this.configService.get('COGNITO_USER_POOL_ID'), this.configService.get('ROLES_GROUP_NAME'), parseInt(cityId, 10));
    }

    @Post('remove-admin')
    @Roles('admin')
    public async removeAdminStatus(@Body() body: {email: string}): Promise<boolean> {
        const username: string = await this.cognitoAuthService.getUsernameByEmail(body.email);
        return await this.cognitoAdminService.removeAdminStatus(username, this.configService.get('COGNITO_USER_POOL_ID'), this.configService.get('ROLES_GROUP_NAME'));
    }
}
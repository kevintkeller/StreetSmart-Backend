import { Controller, Get, UseGuards } from "@nestjs/common";
import { Roles } from "src/common/decorator/roles.decorator";
import { RolesGuard } from "src/common/guard/roles.guard";

@Controller('cognito-admin')
@UseGuards(RolesGuard)
export class CognitoAdminController {

    @Get()
    @Roles('admin')
    public getAdminData() {
        return 'admin data';
    }
}
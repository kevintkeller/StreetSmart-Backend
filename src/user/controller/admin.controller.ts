import { Observable, catchError, map, of } from 'rxjs';
import { Controller, Post, Body, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.interface';
import { Public } from 'src/common/decorator/public.decorator';
import { UserEntity } from '../models/user.entity';
import { UserVerifiedEntity } from '../models/user-verified.entity';
import { ReportContact } from '../models/report-contact.interface';

@Controller('admin')
export class AdminController {

    constructor(private userService: UserService) {}

    @Public()
    @Post('adminFlg')
    findOneBy(@Body() params: any): Observable<Object[]> {
        return this.userService.getAdminFlg(params.id);
    }

    @Public()
    @Get('getAllAdmins')
    getAllAdmins(): Observable<UserVerifiedEntity[]> {
        return this.userService.getAllAdmins();
    }

    @Public()
    @Post('updateAdmin')
    updateAdmin(@Body()body: any) {
        return this.userService.updateAdmin(body.email);
    }

    @Public()
    @Get('getAllReportContacts')
    getAllReportContacts(): Observable<ReportContact[]> {
        return this.userService.getAllReportContacts();
    }

    @Public()
    @Post('addNewReportContact')
    addNewReportContact(@Body() body: ReportContact) {
        return this.userService.addReportContact(body);
    }

    @Public()
    @Post('updateReportContact')
    updateReportContact(@Body()body: any) {
        return this.userService.updateReportContact(body.contactId, body.email, body.reportType);
    }


}
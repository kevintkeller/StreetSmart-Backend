import { Observable, catchError, map, of } from 'rxjs';
import { Controller, Post, Body, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.interface';

@Controller('admin')
export class AdminController {

    constructor(private userService: UserService) {}

    @Post('adminFlg')
    findOneBy(@Body() params: any): Observable<Object[]> {
        return this.userService.getAdminFlg(params.id);
    }

}
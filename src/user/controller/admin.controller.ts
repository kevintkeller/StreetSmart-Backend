import { Observable, catchError, map, of } from 'rxjs';
import { Controller, Post, Body, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.interface';
import { Public } from 'src/common/decorator/public.decorator';

@Controller('admin')
export class AdminController {

    constructor(private userService: UserService) {}

    @Public()
    @Post('adminFlg')
    findOneBy(@Body() params: any): Observable<Object[]> {
        console.log(JSON.stringify(params));
        return this.userService.getAdminFlg(params.id);
    }

}
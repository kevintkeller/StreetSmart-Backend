import { Observable, catchError, map, of } from 'rxjs';
import { Controller, Post, Body, Get, Param, Delete, Put, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.interface';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body()user: User): Observable<User | Object> {
        return this.userService.create(user).pipe(
            map((user: User) => user),
            catchError(err => of({error: err.message}))
        );
    }

    @Post('login')
    login(@Body() user: User): Observable<Object> {
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return {access_token: jwt};
            })
        )
    }

    @Get(':id')
    findOneBy(@Param() params: any): Observable<User> {
        return this.userService.findOneBy(params.id);
    }

    @Get()
    findOneByUsername(@Body() user: any): any {
        console.log("CURRENT USER:" + user);
        return this.userService.findOneByUsername(user.username);
    }

    @Get()
    findAll(): Observable<User[]> {
        return this.userService.findAll();
    }

    @Delete(':id')
    deleteOne(@Param('id')id: string): Observable<User> {
        return this.userService.deleteOne(Number(id));
    }

    @Put(':id')
    updateOne(@Param('id') id: string, @Body() user: User): Observable<any> {
        return this.userService.updateOne(Number(id), user);
    }
}

import { Observable, catchError, map, of, tap } from 'rxjs';
import { Controller, Post, Body, Get, Param, Delete, Put, Query, UseGuards, Req } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { User } from '../models/user.interface';
import { TypedEventEmitter } from '../../event-emitter/typed-event-emitter.class';
import { AuthGuard } from '../../common/guard/auth.guard';
import { Public } from 'src/common/decorator/public.decorator';
import { AuthService } from 'src/auth/service/auth.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService, private readonly eventEmitter: TypedEventEmitter, private authService: AuthService) {}

    @Public()
    @Post()
    async create(@Body()user: User): Promise<User> {
        this.eventEmitter.emit('user.welcome', {
            name: user.name,
            email: user.email
        });

        await this.authService.createEmailToken(user.email);

        const sent = await this.authService.sendEmailVerification(user.email);
        if (sent) {
            this.userService.create(user).pipe(
                map((user: User) => user),
                catchError(err => of({error: err.message}))
            );
            return user;
        }

    }

    @Public()
    @Post('email/verify/:token')
    public async verifyEmail(@Param() params) {
        try {
            const isEmailVerified = await this.authService.verifyEmail(params.token);
            return "Success: user is - " + isEmailVerified;
        } catch (error) {
            return error;
        }
    }

    @Get('email/resend-verification/:email')
    public async resendEmailVerification(@Param() params) {
        try {
            await this.authService.createEmailToken(params.email);
            let isEmailSent = await this.authService.sendEmailVerification(params.email);
            if (isEmailSent) {
                return 'Great success!'
            } else {
                return 'An error occurred while resending the verification email';
            }
        } catch (error) {
            return 'An error occurred while resending the verification email';
        }
    }

    @Get('email/forgot-password/:email')
    public async sendEmailForgotPassword(@Param() params) {
        try {
            const isEmailSend = await this.authService.sendEmailForgotPassword(params.email);
        } catch (error) {
            return 'An error occurred while sending the forgot password email';
        }
    }

    @Public()
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

    @Post('getUserByEmail')
    findOneByUsername(@Body() user: any): Observable<Object[]> {
        return this.userService.findOneByUsername(user.email);
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

    @Post('profile/retrieve')
    getProfile(@Req() req) {
      return req.user;
    }
}

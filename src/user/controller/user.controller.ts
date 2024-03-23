import { Body, Controller, Delete, Get, Param, Post, Put, Req } from '@nestjs/common';
import { Observable, catchError, map, of } from 'rxjs';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { AuthService } from 'src/auth/service/auth.service';
import { Public } from 'src/common/decorator/public.decorator';
import { TypedEventEmitter } from '../../event-emitter/typed-event-emitter.class';
import { User } from '../models/user.interface';
import { UserService } from '../service/user.service';

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

    @Public()
    @Get('email/resend-verification/:email')
    public async resendEmailVerification(@Param() params) {
        try {
            await this.authService.createEmailToken(params.email);
            let isEmailSent = await this.authService.sendEmailVerification(params.email);
            if (isEmailSent) {
                return 'Email successfully sent'
            } else {
                return 'An error occurred while resending the verification email';
            }
        } catch (error) {
            return 'An error occurred while resending the verification email';
        }
    }

    @Public()
    @Get('email/forgot-password/:email')
    public async sendEmailForgotPassword(@Param() params) {
        try {
            const isEmailSent = await this.authService.sendEmailForgotPassword(params.email);
            console.log(isEmailSent);
        } catch (error) {
            return error;
        }
    }

    @Public()
    @Post('login')
    login(@Body() user: User): Observable<Object> {
        console.log('hit');
        return this.userService.login(user).pipe(
            map((jwt: string) => {
                return {access_token: jwt};
            })
        )
    }

    @Public()
    @Get(':id')
    findOneBy(@Param() params: any): Observable<User> {
        return this.userService.findOneBy(params.id);
    }

    @Public()
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

    @Public()
    @Post('email/reset-password')
    public async setNewPassword(@Body() resetPassword: ResetPasswordDto) {
        try {
            if (resetPassword.email && resetPassword.currentPassword) {
                let isNewPasswordChanged: boolean = false;
                if (resetPassword && resetPassword.currentPassword) {
                    isNewPasswordChanged = await this.authService.checkPassword(resetPassword.email, resetPassword.currentPassword);
                } else {
                    return 'wrong current password';
                }
            }
            if (resetPassword.newPasswordToken) {
                let forgottenPassword = await this.authService.getForgottenPasswordModel(resetPassword.newPasswordToken);
                const isNewPasswordChanged = await this.userService.updateVerifiedUser(resetPassword.email, resetPassword.newPassword);
                if (isNewPasswordChanged) {
                    // TODO: remove from forgotten password entity
                    return this.authService.removeForgottenPasswordModel(forgottenPassword);
                } else {
                    return 'fail';
                }
            } else {
                return 'Failure with token provided';
            }
        } catch (error) {
            return error;
        }
    }
}

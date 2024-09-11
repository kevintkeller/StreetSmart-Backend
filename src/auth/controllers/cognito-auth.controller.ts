import { ISignUpResult } from 'amazon-cognito-identity-js';
import { Body, Controller, HttpException, HttpStatus, Post, Res } from "@nestjs/common";
import { CognitoAuthService } from "../service/cognito-auth.service";
import { Public } from "src/common/decorator/public.decorator";
import { RegisterUserInput } from "../models/register-user-input.interface";
import { ConfirmUserInput } from "../models/confirm-user-input.interface";
import { RefreshTokenInput } from "../models/refresh-token-input.interface";
import { ForgotPasswordInput } from '../models/forgot-password-input.interface';
import { ConfirmForgotPasswordInput } from '../models/confirm-forgot-password-input.interface';
import { Response } from 'express';

@Controller('cognito-auth')
export class CognitoAuthController {

    constructor(private readonly cognitoAuthService: CognitoAuthService) {}

    @Public()
    @Post('login')
    public async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) response: Response): Promise<boolean> {
        try {
            const session = await this.cognitoAuthService.authenticateUser(body.email, body.password);

            // Assuming session contains the access token
            const jwt = session.getIdToken().getJwtToken();

            response.cookie('jwt', jwt, {
                httpOnly: true,  // Cookie accessible only by the web server
                secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
                sameSite: 'strict',  // Strict cookie policy
                maxAge: 3600000,  // Cookie expiration time (1 hour in milliseconds)
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    @Public()
    @Post('register')
    public async register(@Body() body: RegisterUserInput): Promise<boolean> {
        const result = await this.cognitoAuthService.registerUser(body);
        return result;
    }

    @Public()
    @Post('confirm')
    public async confirmUser(@Body() input: ConfirmUserInput) {
        return this.cognitoAuthService.confirmUser(input);
    }

    @Public()
    @Post('forgot-password')
    public async forgotPassword(@Body() body: ForgotPasswordInput) {
        const result = await this.cognitoAuthService.forgotPassword(body);
        return result;
    }

    @Public()
    @Post('confirm-forgot-password')
    public async confirmForgotPassword(@Body() body: ConfirmForgotPasswordInput) {
        const result = this.cognitoAuthService.confirmForgotPassword(body);
        return result;
    }

    @Public()
    @Post('refresh-tokens')
    public async refreshTokens(@Body() input: RefreshTokenInput) {
        return this.cognitoAuthService.refreshTokens(input);
    }

}
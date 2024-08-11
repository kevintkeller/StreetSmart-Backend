import { Body, Controller, Post } from "@nestjs/common";
import { CognitoAuthService } from "./service/cognito-auth.service";
import { Public } from "src/common/decorator/public.decorator";
import { RegisterUserInput } from "./models/register-user-input.interface";
import { ConfirmUserInput } from "./models/confirm-user-input.interface";
import { RefreshTokenInput } from "./models/refresh-token-input.interface";

@Controller('cognito-auth')
export class CognitoAuthController {

    constructor(private readonly cognitoAuthService: CognitoAuthService) {}

    @Public()
    @Post('login')
    public async login(@Body() body: { email: string; password: string }) {
        const result = await this.cognitoAuthService.authenticateUser(body.email, body.password);
        return result;
    }

    @Public()
    @Post('register')
    public async register(@Body() body: RegisterUserInput) {
        const result = await this.cognitoAuthService.registerUser(body);
        return result;
    }

    @Public()
    @Post('confirm')
    public async confirmUser(@Body() input: ConfirmUserInput) {
        return this.cognitoAuthService.confirmUser(input);
    }

    @Public()
    @Post('refresh-tokens')
    public async refreshTokens(@Body() input: RefreshTokenInput) {
        return this.cognitoAuthService.refreshTokens(input);
    }
}
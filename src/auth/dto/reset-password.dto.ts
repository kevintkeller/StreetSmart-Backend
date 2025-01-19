export class ResetPasswordDto {
    readonly email: string;
    readonly newPassword: string;
    readonly newPasswordToken: string;
}
export interface ConfirmForgotPasswordInput {
    email: string;
    verificationCode: string;
    newPassword: string;
}
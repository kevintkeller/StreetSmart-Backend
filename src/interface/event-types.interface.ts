import { ForgotPassword } from "src/auth/models/forgot-password.interface";

export interface EventPayloads {
    'user.welcome': { name: string; email: string };
    'user.reset-password': { name: string; email: string; link: string };
    'user.verify-email': { name: string; email: string; otp: string };
    'user.forgot-password': { name: string, email: string; otp: ForgotPassword };
  }
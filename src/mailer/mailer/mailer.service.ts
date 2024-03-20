import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../models/mailer.interface';
import Mail, { Address } from 'nodemailer/lib/mailer';
import { OnEvent } from '@nestjs/event-emitter';
import { EventPayloads } from 'src/interface/event-types.interface';
let fs = require('fs');
let handlbars = require('handlebars');
import {welcomeEmail} from '../templates/welcome-email';

@Injectable()
export class MailerService {

    constructor(private readonly configService: ConfigService) {

    }

    @OnEvent('user.welcome')
    public async welcomeEmail(data: EventPayloads['user.welcome']): Promise<void> {
        const { email, name } = data;
        const subject = 'Welcome to Road Report';

        const replacements = {
            replaceName: name,
        }

        const dto: SendEmailDto = {
            from: {name: this.configService.get<string>('APP_NAME'), address: this.configService.get<string>('DEFAULT_MAIL_FROM') },
            recipients: [{ name: name, address: email }],
            subject: subject,
            html: welcomeEmail,
            placeholderReplacements: replacements,
        };

        await this.sendEmail(dto);
    }

    @OnEvent('user.verify-email')
    public async verifyEmail(data: EventPayloads['user.verify-email']): Promise<void> {
        const { name, email, otp } = data;
        const subject = `Road Report: One Time Passcode`;
        const replacements = {
            replaceName: name,
            passcode: otp
        };
        const dto: SendEmailDto = {
            from: {name: this.configService.get<string>('APP_NAME'), address: this.configService.get<string>('DEFAULT_MAIL_FROM') },
            recipients: [{ name: name, address: email }],
            subject: subject,
            html: '<p>Hello, ' + name + ' Here is your one time passcode: ' + otp + '</p>',
            placeholderReplacements: replacements,
        };
        await this.sendEmail(dto);
    }

    @OnEvent('user.forgot-password')
    public async forgotPasswordEmail(data: EventPayloads['user.forgot-password']): Promise<void> {
        const { name, email, otp } = data;
        const subject = 'Road Report: Reset Password';
        const replacements = {
            replaceName: name,
            passcode: otp.forgotPasswordToken
        };
        const dto: SendEmailDto = {
            from: {name: this.configService.get<string>('APP_NAME'), address: this.configService.get<string>('DEFAULT_MAIL_FROM') },
            recipients: [{ name: name, address: email }],
            subject: subject,
            html: '<p>Hello, ' + name + 'Here is your one time passcode: ' + otp + '</p>',
            placeholderReplacements: replacements,
        };
        await this.sendEmail(dto);
    }

    public mailTransport(): any {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<string>('MAIL_PORT'),
            // TODO: CHANGE THIS VALUE LATER TO TRUE ON PROD
            secure: false,
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
        });
        return transporter;
    }

    async sendEmail(dto: SendEmailDto) {
        const { from, recipients, subject } = dto;
        const html = dto.placeholderReplacements ? this.template(dto.html, dto.placeholderReplacements) : dto.html;
        const transport = this.mailTransport();

        const options: Mail.Options = {
            from: from ?? {
                name: this.configService.get<string>('APP_NAME'),
                address: this.configService.get<string>('DEFAULT_MAIL_FROM'),
            },
            to: recipients,
            subject,
            html,
        }

        try {
            const result = await transport.sendMail(options);
            return result;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    template(html: string, replacements: Record<string, string>) {
        return html.replace(
            /%(\w*)%/g,
            function (m, key) {
                return replacements.hasOwnProperty(key) ? replacements[key] : '';
            },
        );
    }

    getRecipients(): Address[] {
        const recipients: Address[] = [{ name: 'Tester', address: 'test@test.com' }];
        return recipients;
    }
}

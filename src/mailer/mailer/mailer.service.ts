import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from '../models/mailer.interface';
import Mail, { Address } from 'nodemailer/lib/mailer';

@Injectable()
export class MailerService {

    constructor(private configService: ConfigService) {

    }

    mailTransport() {
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

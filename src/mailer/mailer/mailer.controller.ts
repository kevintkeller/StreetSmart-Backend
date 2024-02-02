import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SendEmailDto } from '../models/mailer.interface';

@Controller('mailer')
export class MailerController {
    constructor(private readonly mailerService: MailerService) {}

    @Post('/sendEmail')
    async sendEmail(@Body() body: Record<string, string>) {
        const dto: SendEmailDto = {
            from: {name: body.fromName, address: body.fromAddress },
            recipients: this.mailerService.getRecipients(),
            subject: body.subject,
            html: '<p>yo<strong>HI <strong>%replacementInBody%</strong> YOUR LUCKY NUMBER IS %numRelacementInBody%</strong></p>',
            placeholderReplacements: body,
        };
        
        return await this.mailerService.sendEmail(dto);
    }


}

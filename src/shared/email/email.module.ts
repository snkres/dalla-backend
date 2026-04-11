import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { Resend } from 'resend';
import { EmailType } from './types/email.type';
import { Constants } from '@/shared/constants';
import { EmailQueueProcessor } from './email.queue';
import { EmailService } from './email.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: EmailType.RESEND_EMAIL_HANDLER,
    }),
  ],
  providers: [
    {
      provide: Constants.RESEND_CLIENT,
      useFactory: () => new Resend(process.env.RESEND_API_KEY),
    },
    EmailService,
    EmailQueueProcessor,
  ],
  exports: [Constants.RESEND_CLIENT, EmailService, BullModule],
})
export class EmailModule {}

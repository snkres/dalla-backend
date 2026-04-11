import { Inject, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Resend } from 'resend';
import { Queue } from 'bull';
import { Constants } from '@/shared/constants';
import { EmailInput, EmailType, ResendEmailInput } from './types/email.type';

@Injectable()
export class EmailService {
  constructor(
    @Inject(Constants.RESEND_CLIENT)
    private readonly _resendClient: Resend,
    @InjectQueue(EmailType.RESEND_EMAIL_HANDLER)
    private readonly mailQueue: Queue,
  ) {}

  async sendOtpEmail(data: EmailInput) {
    const emailInput: ResendEmailInput = {
      from: process.env.EMAIL_FROM as string,
      ...data,
    };
    return this.mailQueue.add(EmailType.OTP_EMAIL, emailInput, {
      attempts: 3,
    });
  }

  async sendEmail(data: ResendEmailInput) {
    return this._resendClient.emails.send(data);
  }

  async sendNotificationEmail(batchs: ResendEmailInput[]) {
    try {
      await this._resendClient.batch.send(batchs);
      return true;
    } catch (error) {
      return false;
    }
  }
}

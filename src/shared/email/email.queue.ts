import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { EmailType, ResendEmailInput } from './types/email.type';
import { EmailService } from './email.service';

@Processor(EmailType.RESEND_EMAIL_HANDLER)
export class EmailQueueProcessor {
  constructor(private readonly resendEmailService: EmailService) {}

  @Process(EmailType.OTP_EMAIL)
  async processAuthenticationRequest(job: Job<ResendEmailInput>) {
    return await this.resendEmailService.sendEmail(job.data);
  }

  @Process(EmailType.NOTIFICATION_EMAIL)
  async processSignup(job: Job<ResendEmailInput>) {
    return await this.resendEmailService.sendEmail(job.data);
  }

  @OnQueueActive()
  onActive(job: Job<ResendEmailInput>) {
    console.log(
      `
      Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    console.log(
      `
      Job ${job.id} of type ${job.name} with data ${job.data} was successful. \n Result is: ${result}`,
    );
  }

  @OnQueueError()
  onError(err: Error) {
    console.log(
      `============\n
      Bob failed because: ${err}\n
      ============\n
     `,
    );
  }
}

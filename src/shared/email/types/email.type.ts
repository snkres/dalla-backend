export enum EmailType {
  NOTIFICATION_EMAIL = 'NOTIFICATION_EMAIL',
  OTP_EMAIL = 'OTP_EMAIL',
  RESEND_EMAIL_HANDLER = 'RESEND_EMAIL_HANDLER',
}

export type ResendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from: string;
  reply_to?: string;
  headers?: Record<string, string>;
  attachments?: Attachment[];
};

export type EmailInput = {
  to: string;
  subject: string;
  html: string;
  reply_to?: string;
  headers?: Record<string, string>;
  attachments?: Attachment[];
};

type Attachment = {
  content?: string | Buffer;
  /** Name of attached file. */
  filename?: string | false | undefined;
  /** Path where the attachment file is hosted */
  path?: string;
  /** Optional content type for the attachment, if not set will be derived from the filename property */
  contentType?: string;
};

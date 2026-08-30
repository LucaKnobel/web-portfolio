/**
 * Payload data required to dispatch a contact email.
 */
export type EmailData = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
};

/**
 * Result returned by an email sender implementation.
 */
export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

/**
 * Contract for infrastructure email senders (e.g. Nodemailer, Ethereal).
 */
export interface EmailSender {
  send(data: EmailData): Promise<EmailResult>;
  validateConfig(): Promise<boolean>;
}

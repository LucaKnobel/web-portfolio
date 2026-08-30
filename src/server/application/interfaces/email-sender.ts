export type EmailData = {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
};

export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export interface EmailSender {
  send(data: EmailData): Promise<EmailResult>;
  validateConfig(): Promise<boolean>;
}

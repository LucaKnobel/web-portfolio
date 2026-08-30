import nodemailer from "nodemailer";
import type {
  EmailSender,
  EmailData,
  EmailResult,
} from "@/server/application/interfaces/email-sender.js";
import { buildEmailTemplate } from "@/server/infrastructure/email/email-template.js";

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_PORT) {
    throw new Error(
      "Missing required SMTP configuration. Please check your environment variables.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT, 10),
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const createNodemailerEmailSender = (): EmailSender => ({
  async send(data: EmailData): Promise<EmailResult> {
    try {
      const transporter = createTransporter();
      const { html, text } = buildEmailTemplate(data);

      const info = await transporter.sendMail({
        from: `"${data.firstName} ${data.lastName}" <${process.env.SMTP_FROM}>`,
        to: process.env.SMTP_TO,
        replyTo: data.email,
        subject: `[Web-Portfolio] ${data.subject}`,
        text,
        html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during email sending",
      };
    }
  },

  async validateConfig(): Promise<boolean> {
    try {
      const transporter = createTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  },
});

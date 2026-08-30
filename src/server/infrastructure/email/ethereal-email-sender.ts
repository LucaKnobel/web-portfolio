import nodemailer from "nodemailer";
import type {
  EmailSender,
  EmailData,
  EmailResult,
} from "@/server/application/interfaces/email-sender.js";
import type { Logger } from "@/server/application/interfaces/logger.js";
import { buildEmailTemplate } from "@/server/infrastructure/email/email-template.js";

export const createEtherealEmailSender = (logger: Logger): EmailSender => ({
  async send(data: EmailData): Promise<EmailResult> {
    try {
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const { html, text } = buildEmailTemplate(data);

      const info = await transporter.sendMail({
        from: `"${data.firstName} ${data.lastName}" <${testAccount.user}>`,
        to: "test@example.com",
        replyTo: data.email,
        subject: `[Portfolio DEV] ${data.subject}`,
        text,
        html,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);

      logger.info("[DEV] Email sent via Ethereal", {
        messageId: info.messageId,
        previewUrl,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      logger.error("[DEV] Ethereal error", {}, error);
      return {
        success: false,
        error: "Development SMTP error",
      };
    }
  },

  async validateConfig(): Promise<boolean> {
    logger.info("[DEV] Ethereal SMTP considered valid");
    return true;
  },
});

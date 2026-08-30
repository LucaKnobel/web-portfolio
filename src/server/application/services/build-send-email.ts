import type {
  EmailSender,
  EmailData,
  EmailResult,
} from "@/server/application/interfaces/email-sender.js";
import type { Logger } from "@/server/application/interfaces/logger.js";
import { EmailSendError } from "@/server/application/errors/email-send-error.js";

export type SendEmailDependencies = {
  emailSender: EmailSender;
  logger: Logger;
};

export const buildSendEmail = (deps: SendEmailDependencies) => {
  return async (data: EmailData): Promise<EmailResult> => {
    const { emailSender, logger } = deps;

    logger.info("Starting email delivery process", {
      recipient: data.email,
      subject: data.subject,
    });

    try {
      const result = await emailSender.send(data);

      if (!result.success) {
        logger.error("Failed to send email", {
          error: result.error,
          email: data.email,
        });

        throw new EmailSendError(result.error ?? "Email sending failed");
      }

      logger.info("Email sent successfully", {
        messageId: result.messageId,
        recipient: data.email,
      });

      return result;
    } catch (error) {
      if (error instanceof EmailSendError) {
        throw error;
      }

      logger.error("Unexpected error during send email execution", {}, error);
      throw new EmailSendError(
        "An unexpected error occurred while sending email",
        error,
      );
    }
  };
};

import type {
  EmailSender,
  EmailData,
  EmailResult,
} from "@/server/application/interfaces/email-sender.js";
import type { Logger } from "@/server/application/interfaces/logger.js";
import type { RateLimiter } from "@/server/application/interfaces/rate-limiter.js";
import { EmailSendError } from "@/server/application/errors/email-send-error.js";
import { RateLimitExceededError } from "@/server/application/errors/rate-limit-exceeded-error.js";

export type SendEmailDependencies = {
  emailSender: EmailSender;
  logger: Logger;
  rateLimiter: RateLimiter;
};

export const buildSendEmail = (deps: SendEmailDependencies) => {
  return async (data: EmailData): Promise<EmailResult> => {
    const { emailSender, logger, rateLimiter } = deps;

    const reservation = rateLimiter.tryAcquire();
    if (!reservation) {
      logger.warn("Email sending blocked: rate limit exceeded", {
        recipient: data.email,
      });
      throw new RateLimitExceededError();
    }

    logger.info("Starting email delivery process", {
      recipient: data.email,
      subject: data.subject,
    });

    try {
      const result = await emailSender.send(data);

      if (!result.success) {
        rateLimiter.release(reservation);
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
      rateLimiter.release(reservation);

      if (
        error instanceof RateLimitExceededError ||
        error instanceof EmailSendError
      ) {
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

import { logger } from "@/server/infrastructure/logging/logger.js";
import { createNodemailerEmailSender } from "@/server/infrastructure/email/nodemailer-email-sender.js";
import { createEtherealEmailSender } from "@/server/infrastructure/email/ethereal-email-sender.js";
import { createInMemoryRateLimiter } from "@/server/infrastructure/rate-limit/in-memory-rate-limiter.js";
import { buildSendEmail } from "@/server/application/services/build-send-email.js";

const isDevelopment = process.env.NODE_ENV !== "production";

export const emailSender = isDevelopment
  ? createEtherealEmailSender(logger)
  : createNodemailerEmailSender();

export const rateLimiter = createInMemoryRateLimiter();

export const sendEmail = buildSendEmail({
  emailSender,
  logger,
  rateLimiter,
});

export { logger };

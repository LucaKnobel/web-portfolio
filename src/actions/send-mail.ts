import { defineAction, ActionError } from "astro:actions";
import { getRateLimitService } from "@/services/rate-limit-service.js";
import { contactFormSchema } from "@/server/infrastructure/validation/contact-form-validation.js";
import { sendEmail } from "@/server/infrastructure/composition.js";
import { EmailSendError } from "@/server/application/errors/email-send-error.js";
import { handleActionError } from "@/actions/handle-action-error.js";

export type SendMailResult = {
  success: true;
};

const executeWithRateLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
  const service = getRateLimitService();
  const reservation = service.tryAcquire();

  if (!reservation) {
    throw new ActionError({
      code: "TOO_MANY_REQUESTS",
      message: "Daily email limit reached. Please try again tomorrow.",
    });
  }

  try {
    return await fn();
  } catch (error) {
    service.release(reservation);
    throw error;
  }
};

/** Validates contact data, reserves a slot, and sends the contact email. */
export const sendMail = defineAction({
  accept: "form",
  input: contactFormSchema,

  handler: async ({ privacy, website, ...data }): Promise<SendMailResult> => {
    try {
      await executeWithRateLimit(async () => {
        const result = await sendEmail({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          subject: data.subject,
          message: data.message,
          ...(data.company && { company: data.company }),
          ...(data.phone && { phone: data.phone }),
        });

        if (!result.success) {
          throw new EmailSendError(result.error ?? "Email sending failed");
        }
      });

      return { success: true };
    } catch (error) {
      throw handleActionError(error);
    }
  },
});

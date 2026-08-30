import { defineAction } from "astro:actions";
import { contactFormSchema } from "@/server/infrastructure/validation/contact-form-validation.js";
import { sendEmail } from "@/server/infrastructure/composition.js";
import { handleActionError } from "@/actions/handle-action-error.js";

/**
 * Return type for the successful sendMail action.
 */
export type SendMailResult = {
  success: true;
};

/**
 * Server action that validates contact form input, enforces rate limiting,
 * and sends a contact email using the application layer.
 */
export const sendMail = defineAction({
  accept: "form",
  input: contactFormSchema,

  handler: async ({ privacy, website, ...data }): Promise<SendMailResult> => {
    try {
      await sendEmail({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        subject: data.subject,
        message: data.message,
        ...(data.company && { company: data.company }),
        ...(data.phone && { phone: data.phone }),
      });

      return { success: true };
    } catch (error) {
      throw handleActionError(error);
    }
  },
});

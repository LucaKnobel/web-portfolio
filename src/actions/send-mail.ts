import { defineAction } from "astro:actions";
import { contactFormSchema } from "@/server/infrastructure/validation/contact-form-validation.js";
import { sendEmail } from "@/server/infrastructure/composition.js";
import { handleActionError } from "@/actions/handle-action-error.js";

export type SendMailResult = {
  success: true;
};

/** Validates contact data and sends the contact email. */
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

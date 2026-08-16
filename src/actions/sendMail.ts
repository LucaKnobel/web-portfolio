import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { getEmailService } from "../services/emailService.js";
import { getRateLimitService } from "../services/rateLimitService.js";
import type {
  RateLimitReservation,
  RateLimitService,
} from "../services/rateLimitService.js";
import type { EmailData } from "../utils/email.js";

/** Result returned after a contact email has been sent successfully. */
type SendMailResult = {
  success: true;
};

/** Validates contact data, reserves a slot, and sends the contact email. */
export const sendMail = defineAction({
  accept: "form",
  input: z.object({
    firstName: z.string().min(2).max(50).trim(),
    lastName: z.string().min(2).max(60).trim(),
    email: z.string().email().max(254).toLowerCase(),
    subject: z.string().min(1).max(100).trim(),
    message: z.string().min(1).max(3000).trim(),
    privacy: z.coerce.boolean().refine((val) => val === true),
    company: z.string().max(100).trim().optional(),
    phone: z.string().max(20).trim().optional(),
    website: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => (v ?? "").trim())
      .refine((v) => v === "") /* Honeypot */,
  }),

  handler: async (input): Promise<SendMailResult> => {
    let reservation: RateLimitReservation | null = null;
    let rateLimitService: RateLimitService | null = null;

    try {
      rateLimitService = getRateLimitService();
      const emailService = getEmailService();

      // Reserve a slot before crossing the asynchronous email boundary.
      reservation = rateLimitService.tryAcquire();

      if (reservation === null) {
        throw new ActionError({
          code: "TOO_MANY_REQUESTS",
          message: "Daily email limit reached. Please try again tomorrow.",
        });
      }

      // Keep the reservation when the email succeeds; release it in catch on failure.
      const emailData: EmailData = {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        subject: input.subject,
        message: input.message,
        ...(input.company && { company: input.company }),
        ...(input.phone && { phone: input.phone }),
      };

      const result = await emailService.sendEmail(emailData);

      if (!result.success) {
        console.error("Email sending failed:", result.error);
        throw new ActionError({
          code: "BAD_REQUEST",
          message: "Email service unavailable. Please try again later.",
        });
      }

      console.log("Contact form processed successfully", {
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
      } as const;
    } catch (error) {
      console.error("Unexpected error during email sending:", {
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });

      if (reservation !== null) {
        rateLimitService?.release(reservation);
        reservation = null;
      }

      /* Re-throw ActionErrors as-is */
      if (error instanceof ActionError) {
        throw error;
      }

      /* Convert unexpected errors to ActionError */
      throw new ActionError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  },
});

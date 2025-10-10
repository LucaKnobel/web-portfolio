import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getEmailService } from "../services/emailService.js";
import type { EmailData } from "../utils/email.js";

export const sendMail = defineAction({
    accept: "form",
    input: z.object({
        firstName: z.string().min(2).max(50).trim(),
        lastName: z.string().min(2).max(60).trim(),
        email: z.string().email().max(254).toLowerCase(),
        subject: z.string().min(1).max(100).trim(),
        message: z.string().min(1).max(3000).trim(),
        privacy: z.coerce.boolean().refine(val => val === true),
        company: z.string().max(100).trim().optional(),
        phone: z.string().max(20).trim().optional(),
        website: z.union([z.string(), z.null(), z.undefined()])
                    .transform(v => (v ?? "").trim())
                    .refine(v => v === "") /* Honeypot */
    }),
    
    handler: async (input) => {
        try {
            const emailService = getEmailService();

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
                return { 
                    success: false,
                    error: "Email could not be sent. Please try again later.",
                };
            }

            console.log("Contact form processed successfully", {
                messageId: result.messageId,
                timestamp: new Date().toISOString(),
            });

            return { 
                success: true,
            };

        } catch (error) {
            console.error("Unexpected error during email sending:", {
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            });

            return { 
                success: false,
            };
        }
    }
});
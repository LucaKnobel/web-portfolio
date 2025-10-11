import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { getEmailService } from "../services/emailService.js";
import { db } from "../db/index.js";
import { rateLimits } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { EmailData } from "../utils/email.js";

// Define the success result type
type SendMailResult = {
    success: true;
};

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
    
    handler: async (input): Promise<SendMailResult> => {
        // Get today's date in Swiss timezone (YYYY-MM-DD format)
        const today = new Date().toLocaleDateString('de-CH', {
            year: 'numeric',
            month: '2-digit', 
            day: '2-digit',
            timeZone: 'Europe/Zurich'
        }).split('.').reverse().join('-'); // "2025-10-11"
        
        // 1. Check current rate limit BEFORE sending email
        try {
            const currentCount = await db.select({ count: rateLimits.count })
                .from(rateLimits)
                .where(eq(rateLimits.date, today))
                .get();
            
            if (currentCount && currentCount.count >= 10) {
                throw new ActionError({
                    code: "TOO_MANY_REQUESTS",
                    message: "Daily email limit reached. Please try again tomorrow."
                });
            }
        } catch (error) {
            if (error instanceof ActionError) {
                throw error;
            }
            console.error("Rate limit check failed:", error);
            // Continue anyway - don't block email for DB issues
        }

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
                throw new ActionError({
                    code: "BAD_REQUEST",
                    message: "Email service unavailable. Please try again later."
                });
            }

            console.log("Contact form processed successfully", {
                messageId: result.messageId,
                timestamp: new Date().toISOString(),
            });

            // 2. Increment rate limit counter after successful email
            try {
                // Try to get existing record
                const existingRecord = await db.select()
                    .from(rateLimits)
                    .where(eq(rateLimits.date, today))
                    .get();

                if (existingRecord) {
                    // Update existing record
                    await db.update(rateLimits)
                        .set({ count: existingRecord.count + 1 })
                        .where(eq(rateLimits.date, today));
                } else {
                    // Insert new record
                    await db.insert(rateLimits)
                        .values({ date: today, count: 1 });
                }
                
                console.log("Rate limit counter updated for", today);
            } catch (error) {
                console.error("Failed to update rate limit counter:", error);
                // Don't fail the email for this - email was already sent
            }

            return { 
                success: true,
            } as const;

        } catch (error) {
            console.error("Unexpected error during email sending:", {
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            });

            /* Re-throw ActionErrors as-is */
            if (error instanceof ActionError) {
                throw error;
            }

            /* Convert unexpected errors to ActionError */
            throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",
                message: "An unexpected error occurred. Please try again later."
            });
        }
    }
});
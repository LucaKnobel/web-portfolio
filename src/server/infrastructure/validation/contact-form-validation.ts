import { z } from "astro/zod";

/**
 * Zod validation schema for contact form input data.
 * Includes field constraints, string trimming, honeypot check, and privacy policy enforcement.
 */
export const contactFormSchema = z.object({
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(60).trim(),
  email: z.email().max(254).toLowerCase(),
  subject: z.string().min(1).max(100).trim(),
  message: z.string().min(1).max(3000).trim(),
  privacy: z.coerce.boolean().refine((val) => val === true),
  company: z.string().max(100).trim().optional(),
  phone: z.string().max(20).trim().optional(),
  website: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v ?? "").trim())
    .refine((v) => v === "") /* Honeypot */,
});

/**
 * Validated TypeScript type inferred from contactFormSchema.
 */
export type ContactFormInput = z.infer<typeof contactFormSchema>;

import { sendContactEmail, validateEmailConfig, type EmailData, type EmailResult } from "../utils/email.js";
import nodemailer from 'nodemailer';

export interface EmailService {
    sendEmail: (data: EmailData) => Promise<EmailResult>;
    validateConfig: () => Promise<boolean>;
}

/**
 * Production Email Service
 * Uses real SMTP configured via environment variables
 */
export class ProductionEmailService implements EmailService {
    async sendEmail(data: EmailData): Promise<EmailResult> {
        return await sendContactEmail(data);
    }

    async validateConfig(): Promise<boolean> {
        return await validateEmailConfig();
    }
}

/**
 * Development Email Service
 * Uses Ethereal Email for real SMTP tests without sending actual emails
 */
export class DevelopmentEmailService implements EmailService {
    async sendEmail(data: EmailData): Promise<EmailResult> {
        try {
            const testAccount = await nodemailer.createTestAccount();

            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            const mailOptions = {
                from: `"${data.firstName} ${data.lastName}" <${testAccount.user}>`,
                to: 'test@example.com',
                replyTo: data.email,
                subject: `[Portfolio DEV] ${data.subject}`,
                text: `Development Test\n\n${JSON.stringify(data, null, 2)}`,
                html: `<h3>Development Test</h3><pre>${JSON.stringify(data, null, 2)}</pre>`,
            };

            const info = await transporter.sendMail(mailOptions);
            const previewUrl = nodemailer.getTestMessageUrl(info);

            console.log("[DEV] Email sent via Ethereal:", {
                messageId: info.messageId,
                previewUrl: previewUrl,
                timestamp: new Date().toISOString(),
            });

            return {
                success: true,
                messageId: info.messageId,
            };

        } catch (error) {
            console.error("[DEV] Ethereal error:", error);
            return { success: false, error: 'Development SMTP error' };
        }
    }

    async validateConfig(): Promise<boolean> {
        console.log('[DEV] Ethereal SMTP considered valid');
        return true;
    }
}

/**
 * Factory: Returns appropriate service based on environment
 * Only DEV (Ethereal) or PROD (real SMTP) - tests import MockEmailService directly
 */
export const getEmailService = (): EmailService => {
    const isDevelopment = process.env.NODE_ENV !== "production";

    if (isDevelopment) {
        console.log("Using Ethereal Email Service for development");
        return new DevelopmentEmailService();
    }

    return new ProductionEmailService();
};

/* Re-export types for convenience */
export type { EmailData, EmailResult } from "../utils/email.js";
import { sendContactEmail, validateEmailConfig, type EmailData, type EmailResult } from "../utils/email.js";
import nodemailer from 'nodemailer';

export interface EmailService {
    sendEmail: (data: EmailData) => Promise<EmailResult>;
    validateConfig: () => Promise<boolean>;
}

/**
 * Production Email Service
 * Uses real SMTP for production emails
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
            // Ethereal Email for development SMTP testing
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
 * Mock Email Service for testing
 */
export class MockEmailService implements EmailService {
    private sentEmails: EmailData[] = [];
    private shouldFail = false;

    async sendEmail(data: EmailData): Promise<EmailResult> {
        if (this.shouldFail) {
            return { success: false, error: 'Mock failure' };
        }

        this.sentEmails.push(data);
        console.log("[MOCK] Email recorded:", data.subject);

        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 10));
        return { success: true, messageId: `mock-${Date.now()}` };
    }

    async validateConfig(): Promise<boolean> {
        return !this.shouldFail;
    }

    // Test helpers
    getSentEmails(): EmailData[] {
        return [...this.sentEmails];
    }

    reset(): void {
        this.sentEmails = [];
        this.shouldFail = false;
    }

    setFailure(shouldFail: boolean): void {
        this.shouldFail = shouldFail;
    }
}

/**
 * Factory function - returns the appropriate service based on environment
 */
export const getEmailService = (): EmailService => {
    const isDevelopment = import.meta.env.DEV;
    const isTest = import.meta.env.NODE_ENV === 'test';

    if (isTest) {
        return new MockEmailService();
    }

    if (isDevelopment) {
        console.log("Using Ethereal Email Service for development");
        return new DevelopmentEmailService();
    }

    return new ProductionEmailService();
};
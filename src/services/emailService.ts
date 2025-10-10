import { sendContactEmail, validateEmailConfig, type EmailData, type EmailResult } from "../utils/email.js";
import nodemailer from 'nodemailer';

export interface ContactEmailService {
  sendEmail: (data: EmailData) => Promise<EmailResult>;
  validateConfig: () => Promise<boolean>;
  isConfigured: () => boolean;
}

/**
 * Contact Email Service
 * Direct wrapper for production email functionality
 */
export const contactEmailService: ContactEmailService = {
  sendEmail: async (data: EmailData): Promise<EmailResult> => {
    return await sendContactEmail(data);
  },

  validateConfig: async (): Promise<boolean> => {
    return await validateEmailConfig();
  },

  isConfigured: (): boolean => {
    /* Astro's env system validates automatically */
    return true;
  },
};

/**
 * Development Email Service
 * Uses Ethereal Email for real SMTP tests without sending actual emails
 */
export const developmentEmailService: ContactEmailService = {
  sendEmail: async (data: EmailData): Promise<EmailResult> => {
    try {
      // Ethereal Email for development SMTP testing
      // Creates temporary test accounts: https://ethereal.email
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
        previewUrl: previewUrl, // <- You can view the email here!
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
  },

  validateConfig: async (): Promise<boolean> => {
    console.log('[DEV] Ethereal SMTP considered valid');
    return true;
  },

  isConfigured: (): boolean => {
    return true;
  },
};

/**
 * Simple Mock Service (Fallback)
 */
export const mockEmailService: ContactEmailService = {
  sendEmail: async (data: EmailData): Promise<EmailResult> => {
    console.log("[MOCK] Email would be sent:", {
      to: "knobel.konsum@gmail.com", 
      from: `${data.firstName} ${data.lastName} <${data.email}>`,
      subject: `[Portfolio] ${data.subject}`,
      data: data,
    });

    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, messageId: `mock-${Date.now()}` };
  },

  validateConfig: async (): Promise<boolean> => {
    return true;
  },

  isConfigured: (): boolean => {
    return true;
  },
};

/**
 * Returns the appropriate service based on environment
 * 1. Development: Ethereal Email (real SMTP tests)
 * 2. Production: Real service  
 * 3. Fallback: Mock service
 */
export const getEmailService = (): ContactEmailService => {
  const isDevelopment = import.meta.env.DEV;

  if (isDevelopment) {
    console.log("Using Ethereal Email Service for development");
    return developmentEmailService;
  }

  return contactEmailService;
};
import nodemailer from "nodemailer";

export interface EmailData {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
    company?: string;
    phone?: string;
}

export interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Creates SMTP transporter for Infomaniak
 * Uses process.env for configuration
 */
const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    
    /* Validate required environment variables */
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_PORT) {
        throw new Error("Missing required SMTP configuration. Please check your environment variables.");
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT, 10),
        secure: false,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

/**
 * Escapes HTML to prevent XSS in email templates
 */
const escapeHtml = (text: string): string => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

/**
 * Formats email content with XSS protection
 */
const formatEmailContent = (data: EmailData): { html: string; text: string } => {

    const text = `
        New contact request via web portfolio

        From: ${data.firstName} ${data.lastName}
        Email: ${data.email}
        Company: ${data.company ? data.company : ""}
        Phone: ${data.phone ? data.phone : ""}
        Subject: ${data.subject}

        Message:
        ${data.message}

        ---
        This email was sent via the contact form on lucaknobel.ch
        `.trim();

    /* Escape all user input to prevent XSS */
    const escapedFirstName = escapeHtml(data.firstName);
    const escapedLastName = escapeHtml(data.lastName);
    const escapedEmail = escapeHtml(data.email);
    const escapedCompany = data.company ? escapeHtml(data.company) : '';
    const escapedPhone = data.phone ? escapeHtml(data.phone) : '';
    const escapedSubject = escapeHtml(data.subject);
    const escapedMessage = escapeHtml(data.message);

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Request</h2>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${escapedFirstName} ${escapedLastName}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
            ${escapedCompany ? `<p><strong>Company:</strong> ${escapedCompany}</p>` : ''}
            ${escapedPhone ? `<p><strong>Phone:</strong> ${escapedPhone}</p>` : ''}
            <p><strong>Subject:</strong> ${escapedSubject}</p>
        </div>
        
        <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #007acc; white-space: pre-wrap;">${escapedMessage}</div>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">
            This email was sent via the contact form on <a href="https://lucaknobel.ch">lucaknobel.ch</a>
        </p>
        </div>
    `;

        return { html, text };
};

/**
 * Sends email via Infomaniak SMTP
 */
export const sendContactEmail = async (data: EmailData): Promise<EmailResult> => {
    try {
        const transporter = createTransporter();
        const { html, text } = formatEmailContent(data);

        const mailOptions = {
            from: `"${data.firstName} ${data.lastName}" <${process.env.SMTP_FROM}>`,
            to: process.env.SMTP_TO,
            replyTo: data.email,
            subject: `[Web-Portfolio] ${data.subject}`,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            messageId: info.messageId,
        };

    } catch (error) {

        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error during email sending",
        };
    }
};

/**
 * Validates email configuration
 */
export const validateEmailConfig = async (): Promise<boolean> => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return true;

    } catch (error) {
        return false;
    }
};
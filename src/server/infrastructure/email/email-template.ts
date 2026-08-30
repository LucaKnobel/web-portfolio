import type { EmailData } from "@/server/application/interfaces/email-sender.js";

/**
 * Escapes HTML special characters to prevent HTML injection/XSS in HTML-rendered emails.
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export type FormattedEmailContent = {
  html: string;
  text: string;
};

/**
 * Formats contact email into plain text and HTML versions with XSS protection.
 */
export const buildEmailTemplate = (data: EmailData): FormattedEmailContent => {
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

  const escapedFirstName = escapeHtml(data.firstName);
  const escapedLastName = escapeHtml(data.lastName);
  const escapedEmail = escapeHtml(data.email);
  const escapedCompany = data.company ? escapeHtml(data.company) : "";
  const escapedPhone = data.phone ? escapeHtml(data.phone) : "";
  const escapedSubject = escapeHtml(data.subject);
  const escapedMessage = escapeHtml(data.message);

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Contact Request</h2>
  
  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>From:</strong> ${escapedFirstName} ${escapedLastName}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
    ${escapedCompany ? `<p><strong>Company:</strong> ${escapedCompany}</p>` : ""}
    ${escapedPhone ? `<p><strong>Phone:</strong> ${escapedPhone}</p>` : ""}
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
`.trim();

  return { html, text };
};

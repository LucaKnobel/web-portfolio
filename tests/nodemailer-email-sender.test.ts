import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createNodemailerEmailSender } from "@/server/infrastructure/email/nodemailer-email-sender.js";
import type { EmailData } from "@/server/application/interfaces/email-sender.js";
import nodemailer from "nodemailer";

vi.mock("astro:env/server", () => ({
  get SMTP_HOST() {
    return process.env.SMTP_HOST;
  },
  get SMTP_PORT() {
    return process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  },
  get SMTP_USER() {
    return process.env.SMTP_USER;
  },
  get SMTP_PASS() {
    return process.env.SMTP_PASS;
  },
  get SMTP_FROM() {
    return process.env.SMTP_FROM;
  },
  get SMTP_TO() {
    return process.env.SMTP_TO;
  },
  get LOG_LEVEL() {
    return process.env.LOG_LEVEL ?? "info";
  },
  get APP_VERSION() {
    return process.env.APP_VERSION ?? "dev";
  },
}));

vi.mock("nodemailer");

describe("createNodemailerEmailSender", () => {
  const mockTransporter = {
    sendMail: vi.fn(),
    verify: vi.fn(),
  };

  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(nodemailer.createTransport).mockReturnValue(
      mockTransporter as any,
    );

    process.env = {
      ...originalEnv,
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: "587",
      SMTP_USER: "user@example.com",
      SMTP_PASS: "secret",
      SMTP_FROM: "noreply@example.com",
      SMTP_TO: "owner@example.com",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const validData: EmailData = {
    firstName: "Erika",
    lastName: "Muster",
    email: "erika@example.com",
    subject: "Inquiry",
    message: "I would like to hire you.",
  };

  it("throws error when SMTP configuration env variables are missing", async () => {
    delete process.env.SMTP_HOST;
    const sender = createNodemailerEmailSender();

    const result = await sender.send(validData);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing required SMTP configuration");
  });

  it("sends email successfully with Nodemailer transporter", async () => {
    mockTransporter.sendMail.mockResolvedValue({ messageId: "msg-999" });

    const sender = createNodemailerEmailSender();
    const result = await sender.send(validData);

    expect(result).toEqual({ success: true, messageId: "msg-999" });
    expect(mockTransporter.sendMail).toHaveBeenCalledOnce();

    const mailOptions = mockTransporter.sendMail.mock.calls[0]?.[0];
    expect(mailOptions).toBeDefined();
    expect(mailOptions?.from).toBe('"Erika Muster" <noreply@example.com>');
    expect(mailOptions?.to).toBe("owner@example.com");
    expect(mailOptions?.replyTo).toBe("erika@example.com");
    expect(mailOptions?.subject).toBe("[Web-Portfolio] Inquiry");
  });

  it("escapes HTML in content to prevent XSS", async () => {
    mockTransporter.sendMail.mockResolvedValue({ messageId: "msg-xss" });

    const xssData: EmailData = {
      ...validData,
      firstName: "<script>alert('xss')</script>",
      message: "<img src='x' onerror='alert(1)'>",
      company: "ACME & Co.",
    };

    const sender = createNodemailerEmailSender();
    await sender.send(xssData);

    const mailOptions = mockTransporter.sendMail.mock.calls[0]?.[0];
    expect(mailOptions).toBeDefined();
    expect(mailOptions?.html).not.toContain("<script>");
    expect(mailOptions?.html).toContain(
      "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
    );
    expect(mailOptions?.html).toContain("ACME &amp; Co.");
  });

  it("returns error result when transporter.sendMail fails", async () => {
    mockTransporter.sendMail.mockRejectedValue(new Error("Connection refused"));

    const sender = createNodemailerEmailSender();
    const result = await sender.send(validData);

    expect(result).toEqual({
      success: false,
      error: "Connection refused",
    });
  });

  it("validates configuration successfully", async () => {
    mockTransporter.verify.mockResolvedValue(true);

    const sender = createNodemailerEmailSender();
    const isValid = await sender.validateConfig();

    expect(isValid).toBe(true);
    expect(mockTransporter.verify).toHaveBeenCalled();
  });
});

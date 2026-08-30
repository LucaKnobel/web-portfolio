import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildSendEmail } from "@/server/application/services/build-send-email.js";
import { EmailSendError } from "@/server/application/errors/email-send-error.js";
import type {
  EmailSender,
  EmailData,
} from "@/server/application/interfaces/email-sender.js";
import type { Logger } from "@/server/application/interfaces/logger.js";

describe("buildSendEmail", () => {
  let mockEmailSender: EmailSender;
  let mockLogger: Logger;
  const sampleEmailData: EmailData = {
    firstName: "Max",
    lastName: "Mustermann",
    email: "max@example.com",
    subject: "Test Subject",
    message: "Test message body",
  };

  beforeEach(() => {
    mockEmailSender = {
      send: vi.fn(),
      validateConfig: vi.fn(),
    };

    mockLogger = {
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  it("sends email successfully and logs progress", async () => {
    vi.mocked(mockEmailSender.send).mockResolvedValue({
      success: true,
      messageId: "msg-123",
    });

    const sendEmail = buildSendEmail({
      emailSender: mockEmailSender,
      logger: mockLogger,
    });

    const result = await sendEmail(sampleEmailData);

    expect(result).toEqual({ success: true, messageId: "msg-123" });
    expect(mockEmailSender.send).toHaveBeenCalledWith(sampleEmailData);
    expect(mockLogger.info).toHaveBeenCalledWith(
      "Starting email delivery process",
      {
        recipient: "max@example.com",
        subject: "Test Subject",
      },
    );
    expect(mockLogger.info).toHaveBeenCalledWith("Email sent successfully", {
      messageId: "msg-123",
      recipient: "max@example.com",
    });
  });

  it("throws EmailSendError when email sender returns failure", async () => {
    vi.mocked(mockEmailSender.send).mockResolvedValue({
      success: false,
      error: "SMTP Connection Timeout",
    });

    const sendEmail = buildSendEmail({
      emailSender: mockEmailSender,
      logger: mockLogger,
    });

    await expect(sendEmail(sampleEmailData)).rejects.toThrow(EmailSendError);
    expect(mockLogger.error).toHaveBeenCalledWith("Failed to send email", {
      error: "SMTP Connection Timeout",
      email: "max@example.com",
    });
  });

  it("catches unexpected exceptions and throws EmailSendError", async () => {
    vi.mocked(mockEmailSender.send).mockRejectedValue(
      new Error("Network crash"),
    );

    const sendEmail = buildSendEmail({
      emailSender: mockEmailSender,
      logger: mockLogger,
    });

    await expect(sendEmail(sampleEmailData)).rejects.toThrow(EmailSendError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Unexpected error during send email execution",
      {},
      expect.any(Error),
    );
  });
});

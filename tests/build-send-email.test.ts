import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildSendEmail } from "@/server/application/services/build-send-email.js";
import { EmailSendError } from "@/server/application/errors/email-send-error.js";
import { RateLimitExceededError } from "@/server/application/errors/rate-limit-exceeded-error.js";
import type {
  EmailSender,
  EmailData,
} from "@/server/application/interfaces/email-sender.js";
import type { Logger } from "@/server/application/interfaces/logger.js";
import type { RateLimiter } from "@/server/application/interfaces/rate-limiter.js";

describe("buildSendEmail", () => {
  let mockEmailSender: EmailSender;
  let mockLogger: Logger;
  let mockRateLimiter: RateLimiter;
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

    mockRateLimiter = {
      tryAcquire: vi.fn().mockReturnValue({ date: "2026-08-30" }),
      release: vi.fn(),
      getStatus: vi.fn().mockReturnValue({
        allowed: true,
        currentCount: 1,
        maxLimit: 10,
        resetDate: "2026-08-30",
      }),
      getSwissDate: vi.fn().mockReturnValue("2026-08-30"),
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
      rateLimiter: mockRateLimiter,
    });

    const result = await sendEmail(sampleEmailData);

    expect(result).toEqual({ success: true, messageId: "msg-123" });
    expect(mockRateLimiter.tryAcquire).toHaveBeenCalled();
    expect(mockEmailSender.send).toHaveBeenCalledWith(sampleEmailData);
    expect(mockRateLimiter.release).not.toHaveBeenCalled();
  });

  it("throws RateLimitExceededError when rate limit is reached", async () => {
    vi.mocked(mockRateLimiter.tryAcquire).mockReturnValue(null);

    const sendEmail = buildSendEmail({
      emailSender: mockEmailSender,
      logger: mockLogger,
      rateLimiter: mockRateLimiter,
    });

    await expect(sendEmail(sampleEmailData)).rejects.toThrow(
      RateLimitExceededError,
    );
    expect(mockEmailSender.send).not.toHaveBeenCalled();
  });

  it("releases reservation and throws EmailSendError when email sender returns failure", async () => {
    vi.mocked(mockEmailSender.send).mockResolvedValue({
      success: false,
      error: "SMTP Connection Timeout",
    });

    const sendEmail = buildSendEmail({
      emailSender: mockEmailSender,
      logger: mockLogger,
      rateLimiter: mockRateLimiter,
    });

    await expect(sendEmail(sampleEmailData)).rejects.toThrow(EmailSendError);
    expect(mockRateLimiter.release).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith("Failed to send email", {
      error: "SMTP Connection Timeout",
      email: "max@example.com",
    });
  });

  it("releases reservation and throws EmailSendError on unexpected exception", async () => {
    vi.mocked(mockEmailSender.send).mockRejectedValue(
      new Error("Network crash"),
    );

    const sendEmail = buildSendEmail({
      emailSender: mockEmailSender,
      logger: mockLogger,
      rateLimiter: mockRateLimiter,
    });

    await expect(sendEmail(sampleEmailData)).rejects.toThrow(EmailSendError);
    expect(mockRateLimiter.release).toHaveBeenCalled();
  });
});

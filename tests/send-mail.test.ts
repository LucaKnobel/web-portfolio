import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("astro:actions", () => {
  class ActionError extends Error {
    code: string;

    constructor({ code, message }: { code: string; message?: string }) {
      super(message);
      this.code = code;
    }
  }

  return {
    ActionError,
    defineAction: ({ handler }: { handler: (input: unknown) => unknown }) => {
      const action = async (input: unknown) => handler(input);
      action.orThrow = action;
      return action;
    },
  };
});

vi.mock("astro:schema", async () => ({
  z: (await import("zod")).z,
}));

import { sendEmail } from "@/server/infrastructure/composition.js";
import { sendMail } from "@/actions/send-mail.js";
import { RateLimitExceededError } from "@/server/application/errors/rate-limit-exceeded-error.js";
import { EmailSendError } from "@/server/application/errors/email-send-error.js";

vi.mock("@/server/infrastructure/composition.js", () => ({
  sendEmail: vi.fn(),
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

const validInput = () => ({
  firstName: "Max",
  lastName: "Mustermann",
  email: "max@example.com",
  subject: "Test",
  message: "Hello",
  privacy: true,
  website: "",
});

describe("sendMail action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns success: true when sendEmail succeeds", async () => {
    vi.mocked(sendEmail).mockResolvedValue({
      success: true,
      messageId: "test-id",
    });

    const result = await sendMail.orThrow(validInput() as unknown as FormData);
    expect(result).toEqual({ success: true });
    expect(sendEmail).toHaveBeenCalledWith({
      firstName: "Max",
      lastName: "Mustermann",
      email: "max@example.com",
      subject: "Test",
      message: "Hello",
    });
  });

  it("handles RateLimitExceededError by converting to TOO_MANY_REQUESTS ActionError", async () => {
    vi.mocked(sendEmail).mockRejectedValue(
      new RateLimitExceededError("Daily email limit reached. Please try again tomorrow.")
    );

    await expect(
      sendMail.orThrow(validInput() as unknown as FormData)
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: "Daily email limit reached. Please try again tomorrow.",
    });
  });

  it("handles EmailSendError by converting to BAD_REQUEST ActionError", async () => {
    vi.mocked(sendEmail).mockRejectedValue(
      new EmailSendError("SMTP connection failed")
    );

    await expect(
      sendMail.orThrow(validInput() as unknown as FormData)
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "SMTP connection failed",
    });
  });
});

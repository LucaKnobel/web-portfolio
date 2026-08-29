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

import { getEmailService } from "../src/services/email-service.js";
import {
  getRateLimitService,
  resetRateLimitStateForTests,
} from "../src/services/rate-limit-service.js";
import { sendMail } from "../src/actions/send-mail.js";

vi.mock("../src/services/email-service.js", () => ({
  getEmailService: vi.fn(),
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

describe("sendMail rate-limit reservations", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    vi.clearAllMocks();
  });

  it("keeps exactly one slot after a successful email", async () => {
    vi.mocked(getEmailService).mockReturnValue({
      sendEmail: vi
        .fn()
        .mockResolvedValue({ success: true, messageId: "test" }),
      validateConfig: vi.fn(),
    });

    await sendMail.orThrow(validInput() as unknown as FormData);

    expect(getRateLimitService().getStatus().currentCount).toBe(1);
  });

  it("releases the slot after a failed email", async () => {
    vi.mocked(getEmailService).mockReturnValue({
      sendEmail: vi
        .fn()
        .mockResolvedValue({ success: false, error: "SMTP failed" }),
      validateConfig: vi.fn(),
    });

    await expect(
      sendMail.orThrow(validInput() as unknown as FormData),
    ).rejects.toBeDefined();

    expect(getRateLimitService().getStatus().currentCount).toBe(0);
  });

  it("preserves TOO_MANY_REQUESTS when all slots are reserved", async () => {
    const rateLimitService = getRateLimitService();
    for (let count = 0; count < 10; count += 1) {
      expect(rateLimitService.tryAcquire()).not.toBeNull();
    }

    const sendEmail = vi.fn();
    vi.mocked(getEmailService).mockReturnValue({
      sendEmail,
      validateConfig: vi.fn(),
    });

    await expect(
      sendMail.orThrow(validInput() as unknown as FormData),
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });

    expect(sendEmail).not.toHaveBeenCalled();
  });
});

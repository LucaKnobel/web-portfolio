import { describe, it, expect, vi } from "vitest";

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
  };
});

vi.mock("@/server/infrastructure/composition.js", () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { ActionError } from "astro:actions";
import { ApplicationError } from "@/server/application/errors/application-error.js";
import { RateLimitExceededError } from "@/server/application/errors/rate-limit-exceeded-error.js";
import { handleActionError } from "@/actions/handle-action-error.js";

describe("handleActionError", () => {
  it("re-throws ActionError as is", () => {
    const actionErr = new ActionError({
      code: "BAD_REQUEST",
      message: "Custom action error",
    });

    expect(() => handleActionError(actionErr)).toThrow(actionErr);
  });

  it("converts RateLimitExceededError to TOO_MANY_REQUESTS ActionError", () => {
    const rateErr = new RateLimitExceededError("Limit reached");

    try {
      handleActionError(rateErr);
    } catch (err) {
      expect(err).toBeInstanceOf(ActionError);
      expect((err as any).code).toBe("TOO_MANY_REQUESTS");
      expect((err as any).message).toBe("Limit reached");
    }
  });

  it("converts general ApplicationError to BAD_REQUEST ActionError", () => {
    const appErr = new ApplicationError("Invalid domain state", "DOMAIN_ERROR");

    try {
      handleActionError(appErr);
    } catch (err) {
      expect(err).toBeInstanceOf(ActionError);
      expect((err as any).code).toBe("BAD_REQUEST");
      expect((err as any).message).toBe("Invalid domain state");
    }
  });

  it("converts unknown error to INTERNAL_SERVER_ERROR ActionError", () => {
    const unknownErr = new Error("Database crashed");

    try {
      handleActionError(unknownErr);
    } catch (err) {
      expect(err).toBeInstanceOf(ActionError);
      expect((err as any).code).toBe("INTERNAL_SERVER_ERROR");
      expect((err as any).message).toBe(
        "An unexpected error occurred. Please try again later.",
      );
    }
  });
});

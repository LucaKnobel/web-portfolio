import { describe, it, expect, vi, beforeEach } from "vitest";

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

import { EmailSendError } from "@/server/application/errors/email-send-error.js";
import { logger } from "@/server/infrastructure/composition.js";

// Fail explicitly if error mapping ever stops throwing.
function captureActionError(error: unknown): ActionError {
  try {
    handleActionError(error);
  } catch (caught) {
    expect(caught).toBeInstanceOf(ActionError);
    return caught as ActionError;
  }
  throw new Error("Expected handleActionError to throw");
}

describe("handleActionError", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves intentional input ActionErrors", () => {
    const inputError = new ActionError({ code: "BAD_REQUEST", message: "Invalid input" });
    expect(captureActionError(inputError)).toBe(inputError);
  });

  it("maps rate limits to a safe TOO_MANY_REQUESTS response", () => {
    expect(captureActionError(new RateLimitExceededError("Internal quota details"))).toMatchObject({
      code: "TOO_MANY_REQUESTS",
      message: "Daily email limit reached. Please try again tomorrow.",
    });
  });

  it("keeps SMTP diagnostics and the original cause in server logs only", () => {
    const cause = new Error("Connection to private SMTP host failed");
    const error = new EmailSendError("SMTP authentication failed for internal account", cause);
    expect(captureActionError(error)).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email could not be sent. Please try again later.",
    });
    expect(logger.error).toHaveBeenCalledWith(
      "Application error during action execution",
      { code: "EMAIL_SEND_ERROR", message: error.message },
      error,
    );
  });

  it.each([
    new ApplicationError("Internal domain state", "DOMAIN_ERROR"),
    new Error("Database crashed"),
    "Unexpected internal failure",
  ])("does not expose unclassified failures: %s", (error) => {
    expect(captureActionError(error)).toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred. Please try again later.",
    });
    expect(logger.error).toHaveBeenCalled();
  });
});

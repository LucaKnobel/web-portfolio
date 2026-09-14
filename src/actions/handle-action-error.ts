import { ActionError } from "astro:actions";
import { ApplicationError } from "@/server/application/errors/application-error.js";
import { logger } from "@/server/infrastructure/composition.js";

/**
 * Handles errors thrown in server actions by logging them
 * and converting them into typed Astro ActionErrors.
 */
export const handleActionError = (error: unknown): never => {
  if (error instanceof ActionError) {
    throw error;
  }

  if (error instanceof ApplicationError) {
    logger.error("Application error during action execution", {
      code: error.code,
      message: error.message,
    }, error);

    if (error.code === "RATE_LIMIT_EXCEEDED") {
      throw new ActionError({
        code: "TOO_MANY_REQUESTS",
        message: "Daily email limit reached. Please try again tomorrow.",
      });
    }

    // Input errors are handled by the action schema. Application failures
    // are server errors; their technical details belong only in the logs.
    throw new ActionError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.code === "EMAIL_SEND_ERROR"
        ? "Email could not be sent. Please try again later."
        : "An unexpected error occurred. Please try again later.",
    });
  }

  logger.error("Unexpected error during action execution", {}, error);

  throw new ActionError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred. Please try again later.",
  });
};
